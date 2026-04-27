import { Router, type IRouter } from "express";
import { eq, desc, sql, and, ne } from "drizzle-orm";
import {
  db,
  customersTable,
  appointmentsTable,
  sessionsTable,
} from "@workspace/db";
import {
  UpdateCustomerBody,
  SetCustomerPasswordBody,
} from "@workspace/api-zod";
import { hashPassword, publicCustomer } from "../lib/auth";

const router: IRouter = Router();

router.get("/customers", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: customersTable.id,
      email: customersTable.email,
      name: customersTable.name,
      phone: customersTable.phone,
      emailVerifiedAt: customersTable.emailVerifiedAt,
      createdAt: customersTable.createdAt,
      appointmentCount: sql<number>`count(${appointmentsTable.id})::int`,
      lastAppointmentAt: sql<
        Date | null
      >`max(${appointmentsTable.startsAt})`,
    })
    .from(customersTable)
    .leftJoin(
      appointmentsTable,
      eq(appointmentsTable.customerId, customersTable.id),
    )
    .groupBy(customersTable.id)
    .orderBy(desc(customersTable.createdAt));

  res.json(
    rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      phone: r.phone,
      emailVerifiedAt: r.emailVerifiedAt
        ? new Date(r.emailVerifiedAt).toISOString()
        : null,
      createdAt: new Date(r.createdAt).toISOString(),
      appointmentCount: r.appointmentCount ?? 0,
      lastAppointmentAt: r.lastAppointmentAt
        ? new Date(r.lastAppointmentAt).toISOString()
        : null,
    })),
  );
});

router.patch("/customers/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "bad_request", message: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Kunde nicht gefunden" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name.trim();
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone.trim();
  if (parsed.data.email !== undefined) {
    const normEmail = parsed.data.email.trim().toLowerCase();
    if (normEmail !== existing.email) {
      const [taken] = await db
        .select({ id: customersTable.id })
        .from(customersTable)
        .where(
          and(eq(customersTable.email, normEmail), ne(customersTable.id, id)),
        );
      if (taken) {
        res
          .status(409)
          .json({ error: "email_taken", message: "Diese Mail ist schon vergeben" });
        return;
      }
      updates.email = normEmail;
    }
  }

  if (Object.keys(updates).length === 0) {
    res.json(publicCustomer(existing));
    return;
  }

  const [updated] = await db
    .update(customersTable)
    .set(updates)
    .where(eq(customersTable.id, id))
    .returning();
  if (!updated) {
    res
      .status(500)
      .json({ error: "server_error", message: "Aktualisieren fehlgeschlagen" });
    return;
  }
  res.json(publicCustomer(updated));
});

router.post("/customers/:id/password", async (req, res): Promise<void> => {
  const { id } = req.params;
  const parsed = SetCustomerPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "bad_request", message: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select({ id: customersTable.id })
    .from(customersTable)
    .where(eq(customersTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Kunde nicht gefunden" });
    return;
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db
    .update(customersTable)
    .set({ passwordHash })
    .where(eq(customersTable.id, id));
  await db.delete(sessionsTable).where(eq(sessionsTable.customerId, id));
  res.status(204).end();
});

router.delete("/customers/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const [existing] = await db
    .select({ id: customersTable.id })
    .from(customersTable)
    .where(eq(customersTable.id, id));
  if (!existing) {
    res.status(204).end();
    return;
  }
  await db.delete(sessionsTable).where(eq(sessionsTable.customerId, id));
  await db
    .update(appointmentsTable)
    .set({ customerId: null })
    .where(eq(appointmentsTable.customerId, id));
  await db.delete(customersTable).where(eq(customersTable.id, id));
  res.status(204).end();
});

export default router;
