import { Router, type IRouter } from "express";
import { and, eq, gte, lte, ne } from "drizzle-orm";
import {
  db,
  servicesTable,
  appointmentsTable,
  stylistsTable,
} from "@workspace/db";
import { GetAvailabilityQueryParams, GetAvailabilityResponse } from "@workspace/api-zod";
import {
  generateCandidateStarts,
  overlaps,
} from "../lib/scheduling";

const router: IRouter = Router();

router.get("/availability", async (req, res): Promise<void> => {
  const parsed = GetAvailabilityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "bad_request", message: parsed.error.message });
    return;
  }
  const { serviceId, stylistId, date } = parsed.data;

  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, serviceId));
  if (!service) {
    res.status(404).json({ error: "not_found", message: "Service nicht gefunden" });
    return;
  }

  const [stylist] = await db
    .select()
    .from(stylistsTable)
    .where(eq(stylistsTable.id, stylistId));
  if (!stylist) {
    res.status(404).json({ error: "not_found", message: "Stylist:in nicht gefunden" });
    return;
  }

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const existing = await db
    .select()
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.stylistId, stylistId),
        ne(appointmentsTable.status, "cancelled"),
        gte(appointmentsTable.startsAt, dayStart),
        lte(appointmentsTable.startsAt, dayEnd),
      ),
    );

  const candidates = generateCandidateStarts(date);
  const now = new Date();
  const slots = candidates.map((startsAt) => {
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60000);
    const dayCloseHour = 19;
    const dayClose = new Date(`${date}T${String(dayCloseHour).padStart(2, "0")}:00:00.000Z`);
    const tooLate = endsAt > dayClose;
    const past = startsAt < now;
    const conflict = existing.some((a) =>
      overlaps(startsAt, endsAt, new Date(a.startsAt), new Date(a.endsAt)),
    );
    return {
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      available: !tooLate && !past && !conflict,
    };
  });

  res.json(GetAvailabilityResponse.parse({ date, slots }));
});

export default router;
