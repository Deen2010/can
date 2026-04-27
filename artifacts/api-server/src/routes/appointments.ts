import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { and, eq, gte, lte, ne, asc } from "drizzle-orm";
import {
  db,
  appointmentsTable,
  servicesTable,
  stylistsTable,
} from "@workspace/db";
import {
  CreateAppointmentBody,
  GetAppointmentParams,
  GetAppointmentResponse,
  ListAppointmentsQueryParams,
  ListAppointmentsResponse,
  CancelAppointmentParams,
  CancelAppointmentResponse,
  UpdateAppointmentStatusParams,
  UpdateAppointmentStatusBody,
  UpdateAppointmentStatusResponse,
} from "@workspace/api-zod";
import { overlaps } from "../lib/scheduling";

const router: IRouter = Router();

async function hydrate(appointmentRow: typeof appointmentsTable.$inferSelect) {
  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, appointmentRow.serviceId));
  const [stylist] = await db
    .select()
    .from(stylistsTable)
    .where(eq(stylistsTable.id, appointmentRow.stylistId));
  return {
    ...appointmentRow,
    startsAt: appointmentRow.startsAt.toISOString(),
    endsAt: appointmentRow.endsAt.toISOString(),
    createdAt: appointmentRow.createdAt.toISOString(),
    service: service ?? undefined,
    stylist: stylist ?? undefined,
  };
}

router.get("/appointments", async (req, res): Promise<void> => {
  const parsed = ListAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "bad_request", message: parsed.error.message });
    return;
  }
  const { from, to, status, stylistId } = parsed.data;
  const conditions = [];
  if (from) conditions.push(gte(appointmentsTable.startsAt, new Date(from)));
  if (to) conditions.push(lte(appointmentsTable.startsAt, new Date(to)));
  if (status) conditions.push(eq(appointmentsTable.status, status));
  if (stylistId) conditions.push(eq(appointmentsTable.stylistId, stylistId));

  const rows = await db
    .select()
    .from(appointmentsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(appointmentsTable.startsAt));

  const hydrated = await Promise.all(rows.map(hydrate));
  res.json(ListAppointmentsResponse.parse(hydrated));
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "bad_request", message: parsed.error.message });
    return;
  }
  const data = parsed.data;

  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, data.serviceId));
  if (!service) {
    res.status(400).json({ error: "bad_request", message: "Service nicht gefunden" });
    return;
  }

  const [stylist] = await db
    .select()
    .from(stylistsTable)
    .where(eq(stylistsTable.id, data.stylistId));
  if (!stylist) {
    res.status(400).json({ error: "bad_request", message: "Stylist:in nicht gefunden" });
    return;
  }

  const startsAt = new Date(data.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    res.status(400).json({ error: "bad_request", message: "Ungültiger Startzeitpunkt" });
    return;
  }
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60000);

  const dayStart = new Date(startsAt);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(startsAt);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const existing = await db
    .select()
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.stylistId, data.stylistId),
        ne(appointmentsTable.status, "cancelled"),
        gte(appointmentsTable.startsAt, dayStart),
        lte(appointmentsTable.startsAt, dayEnd),
      ),
    );

  const conflict = existing.some((a) =>
    overlaps(startsAt, endsAt, new Date(a.startsAt), new Date(a.endsAt)),
  );
  if (conflict) {
    res
      .status(409)
      .json({ error: "slot_taken", message: "Dieser Zeitslot ist bereits vergeben." });
    return;
  }

  const id = randomUUID();
  const [created] = await db
    .insert(appointmentsTable)
    .values({
      id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      notes: data.notes ?? null,
      serviceId: data.serviceId,
      stylistId: data.stylistId,
      startsAt,
      endsAt,
      status: "pending",
    })
    .returning();

  if (!created) {
    res.status(500).json({ error: "server_error", message: "Buchung fehlgeschlagen" });
    return;
  }

  const hydrated = await hydrate(created);
  res.status(201).json(GetAppointmentResponse.parse(hydrated));
});

router.get("/appointments/:id", async (req, res): Promise<void> => {
  const params = GetAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "bad_request", message: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "not_found", message: "Termin nicht gefunden" });
    return;
  }
  res.json(GetAppointmentResponse.parse(await hydrate(row)));
});

router.patch("/appointments/:id/status", async (req, res): Promise<void> => {
  const params = UpdateAppointmentStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "bad_request", message: params.error.message });
    return;
  }
  const body = UpdateAppointmentStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "bad_request", message: body.error.message });
    return;
  }
  const [updated] = await db
    .update(appointmentsTable)
    .set({ status: body.data.status })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Termin nicht gefunden" });
    return;
  }
  res.json(UpdateAppointmentStatusResponse.parse(await hydrate(updated)));
});

router.delete("/appointments/:id", async (req, res): Promise<void> => {
  const params = CancelAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "bad_request", message: params.error.message });
    return;
  }
  const [updated] = await db
    .update(appointmentsTable)
    .set({ status: "cancelled" })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Termin nicht gefunden" });
    return;
  }
  res.json(CancelAppointmentResponse.parse(await hydrate(updated)));
});

export default router;
