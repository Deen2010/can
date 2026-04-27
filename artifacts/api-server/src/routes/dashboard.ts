import { Router, type IRouter } from "express";
import { and, eq, gte, lte, ne, asc, sql } from "drizzle-orm";
import {
  db,
  appointmentsTable,
  servicesTable,
  stylistsTable,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetUpcomingAppointmentsQueryParams,
  GetUpcomingAppointmentsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diffToMonday = (day + 6) % 7;
  weekStart.setDate(weekStart.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const todayRows = await db
    .select()
    .from(appointmentsTable)
    .where(
      and(
        ne(appointmentsTable.status, "cancelled"),
        gte(appointmentsTable.startsAt, todayStart),
        lte(appointmentsTable.startsAt, todayEnd),
      ),
    );

  const weekRows = await db
    .select({
      id: appointmentsTable.id,
      serviceId: appointmentsTable.serviceId,
      priceCents: servicesTable.priceCents,
    })
    .from(appointmentsTable)
    .innerJoin(servicesTable, eq(servicesTable.id, appointmentsTable.serviceId))
    .where(
      and(
        ne(appointmentsTable.status, "cancelled"),
        gte(appointmentsTable.startsAt, weekStart),
        lte(appointmentsTable.startsAt, weekEnd),
      ),
    );

  const upcomingCountRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointmentsTable)
    .where(
      and(
        ne(appointmentsTable.status, "cancelled"),
        gte(appointmentsTable.startsAt, now),
      ),
    );
  const upcomingCount = upcomingCountRows[0]?.count ?? 0;

  const revenueThisWeekCents = weekRows.reduce(
    (sum, r) => sum + (r.priceCents ?? 0),
    0,
  );

  const topRows = await db
    .select({
      serviceId: appointmentsTable.serviceId,
      name: servicesTable.name,
      bookings: sql<number>`count(*)::int`,
    })
    .from(appointmentsTable)
    .innerJoin(servicesTable, eq(servicesTable.id, appointmentsTable.serviceId))
    .where(ne(appointmentsTable.status, "cancelled"))
    .groupBy(appointmentsTable.serviceId, servicesTable.name)
    .orderBy(sql`count(*) desc`)
    .limit(1);

  const top = topRows[0];

  res.json(
    GetDashboardSummaryResponse.parse({
      appointmentsToday: todayRows.length,
      appointmentsThisWeek: weekRows.length,
      upcomingCount,
      revenueThisWeekCents,
      topService: top
        ? {
            serviceId: top.serviceId,
            name: top.name,
            bookings: top.bookings,
          }
        : null,
    }),
  );
});

router.get("/dashboard/upcoming", async (req, res): Promise<void> => {
  const parsed = GetUpcomingAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "bad_request", message: parsed.error.message });
    return;
  }
  const limit = parsed.data.limit ?? 10;
  const now = new Date();
  const rows = await db
    .select()
    .from(appointmentsTable)
    .where(
      and(
        ne(appointmentsTable.status, "cancelled"),
        gte(appointmentsTable.startsAt, now),
      ),
    )
    .orderBy(asc(appointmentsTable.startsAt))
    .limit(limit);

  const hydrated = await Promise.all(
    rows.map(async (a) => {
      const [service] = await db
        .select()
        .from(servicesTable)
        .where(eq(servicesTable.id, a.serviceId));
      const [stylist] = await db
        .select()
        .from(stylistsTable)
        .where(eq(stylistsTable.id, a.stylistId));
      return {
        ...a,
        startsAt: a.startsAt.toISOString(),
        endsAt: a.endsAt.toISOString(),
        createdAt: a.createdAt.toISOString(),
        service: service ?? undefined,
        stylist: stylist ?? undefined,
      };
    }),
  );

  res.json(GetUpcomingAppointmentsResponse.parse(hydrated));
});

export default router;
