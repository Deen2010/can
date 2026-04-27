import { PageTransition } from "@/components/layout";
import {
  useGetDashboardSummary,
  useGetUpcomingAppointments,
  useListAppointments,
  useUpdateAppointmentStatus,
  useCancelAppointment,
  getGetDashboardSummaryQueryKey,
  getGetUpcomingAppointmentsQueryKey,
  getListAppointmentsQueryKey,
} from "@workspace/api-client-react";
import { useEffect, useMemo, useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  isSameDay,
  isWithinInterval,
  differenceInMinutes,
  startOfDay,
  endOfDay,
} from "date-fns";
import { de } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { BarberPoleIcon, ScissorIcon } from "@/components/scissor-icon";

const ADMIN_PASSWORD = "cankann";
const STORAGE_KEY = "mainusch_admin_unlocked";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      onUnlock();
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 vintage-paper opacity-50 pointer-events-none" />
      <div className="relative w-full max-w-md border-4 border-foreground bg-background">
        <div className="h-3 barber-stripes-thin border-b-2 border-foreground" />
        <div className="p-10 text-center">
          <BarberPoleIcon className="w-6 h-16 text-foreground mx-auto mb-4" />
          <div className="font-display text-3xl tracking-[0.18em] mb-1">MAINUSCH</div>
          <div className="font-serif italic text-xs text-primary tracking-widest mb-8">
            Interner Bereich
          </div>
          <form onSubmit={submit} className="space-y-5 text-left">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/70 font-bold">
                Passwort
              </span>
              <input
                type="password"
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(false);
                }}
                className={`mt-2 w-full bg-background border-2 border-foreground px-4 py-3 font-serif text-lg outline-none focus:border-primary transition-colors ${
                  error ? "border-destructive" : ""
                }`}
                placeholder="••••••••"
              />
              {error && (
                <span className="mt-2 block text-xs text-destructive uppercase tracking-widest">
                  Falsches Passwort
                </span>
              )}
            </label>
            <button
              type="submit"
              className="group w-full inline-flex items-center justify-center gap-3 bg-foreground text-background px-6 py-4 font-bold text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors border-2 border-foreground"
            >
              Einloggen
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </form>
        </div>
        <div className="h-3 barber-stripes-thin border-t-2 border-foreground" />
      </div>
    </div>
  );
}

type Appointment = {
  id: string;
  customerName: string;
  startsAt: string;
  endsAt: string;
  status: string;
  notes?: string | null;
  service?: { name: string } | null;
  stylist?: { name: string } | null;
};

const HOUR_START = 9;
const HOUR_END = 22;
const HOUR_HEIGHT = 56;
const TOTAL_HOURS = HOUR_END - HOUR_START;

function WeekCalendar({
  appointments,
  onConfirm,
  onCancel,
}: {
  appointments: Appointment[];
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const weekAppointments = useMemo(
    () =>
      appointments.filter((apt) => {
        const start = new Date(apt.startsAt);
        return isWithinInterval(start, {
          start: startOfDay(weekStart),
          end: endOfDay(addDays(weekStart, 6)),
        });
      }),
    [appointments, weekStart],
  );

  const today = new Date();
  const selectedAppointment = selectedId
    ? appointments.find((a) => a.id === selectedId) ?? null
    : null;

  const formatRange = () => {
    const last = addDays(weekStart, 6);
    if (weekStart.getMonth() === last.getMonth()) {
      return `${format(weekStart, "dd.")} – ${format(last, "dd. MMMM yyyy", { locale: de })}`;
    }
    return `${format(weekStart, "dd. MMM", { locale: de })} – ${format(last, "dd. MMM yyyy", { locale: de })}`;
  };

  const positionFor = (apt: Appointment) => {
    const start = new Date(apt.startsAt);
    const end = new Date(apt.endsAt);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const offsetMinutes = startMinutes - HOUR_START * 60;
    const durationMinutes = Math.max(differenceInMinutes(end, start), 15);
    const top = (offsetMinutes / 60) * HOUR_HEIGHT;
    const height = (durationMinutes / 60) * HOUR_HEIGHT;
    return { top, height };
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => addWeeks(w, -1))}
            className="border-2 border-foreground px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-foreground hover:text-background transition-colors"
            data-testid="button-prev-week"
          >
            ← Woche
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="border-2 border-foreground bg-foreground text-background px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-primary hover:border-primary transition-colors"
            data-testid="button-today"
          >
            Heute
          </button>
          <button
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            className="border-2 border-foreground px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-foreground hover:text-background transition-colors"
            data-testid="button-next-week"
          >
            Woche →
          </button>
        </div>
        <div className="font-serif italic text-lg" data-testid="text-week-range">
          {formatRange()}
        </div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
          {weekAppointments.length} Termine in dieser Woche
        </div>
      </div>

      {/* Grid */}
      <div className="border-2 border-foreground bg-background overflow-x-auto">
        <div className="grid min-w-[760px]" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          {/* Header row */}
          <div className="border-b-2 border-r border-foreground bg-secondary" />
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={`text-center py-3 border-b-2 border-r border-foreground last:border-r-0 ${
                  isToday ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}
              >
                <div
                  className={`text-[9px] uppercase tracking-[0.3em] font-bold ${
                    isToday ? "" : "text-muted-foreground"
                  }`}
                >
                  {format(day, "eee", { locale: de })}
                </div>
                <div className="font-display text-2xl mt-0.5">
                  {format(day, "dd")}
                </div>
              </div>
            );
          })}

          {/* Time gutter */}
          <div className="border-r border-foreground bg-secondary/40 relative">
            {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
              <div
                key={i}
                className="text-[9px] font-bold text-muted-foreground text-right pr-2 -translate-y-1/2"
                style={{ position: "absolute", top: i * HOUR_HEIGHT, right: 0 }}
              >
                {String(HOUR_START + i).padStart(2, "0")}:00
              </div>
            ))}
            <div style={{ height: TOTAL_HOURS * HOUR_HEIGHT }} />
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayAppointments = weekAppointments.filter((apt) =>
              isSameDay(new Date(apt.startsAt), day),
            );
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={`relative border-r border-foreground last:border-r-0 ${
                  isToday ? "bg-primary/5" : ""
                }`}
                style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
              >
                {/* Hour grid lines */}
                {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-border"
                    style={{ top: i * HOUR_HEIGHT }}
                  />
                ))}
                {/* Half-hour grid lines */}
                {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                  <div
                    key={`half-${i}`}
                    className="absolute left-0 right-0 border-t border-border/30"
                    style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                  />
                ))}

                {/* Appointments */}
                {dayAppointments.map((apt) => {
                  const { top, height } = positionFor(apt);
                  const statusClass =
                    apt.status === "confirmed"
                      ? "bg-primary/15 border-primary text-foreground"
                      : apt.status === "cancelled"
                        ? "bg-muted/40 border-muted-foreground text-muted-foreground line-through"
                        : "bg-secondary border-foreground text-foreground";
                  return (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedId(apt.id)}
                      data-testid={`appointment-${apt.id}`}
                      className={`absolute left-1 right-1 border-l-4 ${statusClass} px-2 py-1 text-left overflow-hidden hover:z-10 hover:shadow-lg transition-shadow`}
                      style={{ top: top + 1, height: Math.max(height - 2, 24) }}
                    >
                      <div className="text-[10px] uppercase tracking-widest font-bold leading-tight truncate">
                        {format(new Date(apt.startsAt), "HH:mm")} ·{" "}
                        {apt.service?.name ?? ""}
                      </div>
                      <div className="font-serif text-sm font-bold leading-tight truncate">
                        {apt.customerName}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selectedAppointment && (
        <div
          className="mt-4 border-2 border-foreground bg-background p-5"
          data-testid="appointment-detail"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-1">
                Termin
              </div>
              <div className="font-serif text-2xl font-bold mb-1">
                {selectedAppointment.customerName}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest flex flex-wrap gap-x-3 gap-y-1">
                <span>
                  {format(new Date(selectedAppointment.startsAt), "EEEE, dd.MM.yyyy", {
                    locale: de,
                  })}
                </span>
                <span>
                  {format(new Date(selectedAppointment.startsAt), "HH:mm")} –{" "}
                  {format(new Date(selectedAppointment.endsAt), "HH:mm")}
                </span>
                <span>·</span>
                <span>{selectedAppointment.service?.name}</span>
                <span>·</span>
                <span>{selectedAppointment.stylist?.name}</span>
                <span>·</span>
                <span
                  className={
                    selectedAppointment.status === "confirmed"
                      ? "text-primary"
                      : selectedAppointment.status === "cancelled"
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }
                >
                  {selectedAppointment.status === "confirmed"
                    ? "Bestätigt"
                    : selectedAppointment.status === "cancelled"
                      ? "Storniert"
                      : "Ausstehend"}
                </span>
              </div>
              {selectedAppointment.notes && (
                <div className="mt-3 text-sm text-foreground italic border-l-2 border-primary pl-3">
                  „{selectedAppointment.notes}"
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {selectedAppointment.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      onConfirm(selectedAppointment.id);
                      setSelectedId(null);
                    }}
                    className="bg-foreground text-background uppercase tracking-[0.2em] text-[10px] font-bold px-4 py-2 hover:bg-primary transition-colors border-2 border-foreground"
                    data-testid="button-detail-confirm"
                  >
                    Bestätigen
                  </button>
                  <button
                    onClick={() => {
                      onCancel(selectedAppointment.id);
                      setSelectedId(null);
                    }}
                    className="text-destructive uppercase tracking-[0.2em] text-[10px] font-bold px-4 py-2 border-2 border-destructive hover:bg-destructive hover:text-white transition-colors"
                    data-testid="button-detail-cancel"
                  >
                    Ablehnen
                  </button>
                </>
              )}
              {selectedAppointment.status === "confirmed" && (
                <button
                  onClick={() => {
                    onCancel(selectedAppointment.id);
                    setSelectedId(null);
                  }}
                  className="text-destructive uppercase tracking-[0.2em] text-[10px] font-bold px-4 py-2 border-2 border-destructive hover:bg-destructive hover:text-white transition-colors"
                  data-testid="button-detail-cancel-confirmed"
                >
                  Stornieren
                </button>
              )}
              <button
                onClick={() => setSelectedId(null)}
                className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold px-4 py-2 hover:text-foreground transition-colors"
                data-testid="button-detail-close"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-secondary border-l-4 border-foreground" />
          Ausstehend
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-primary/15 border-l-4 border-primary" />
          Bestätigt
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-muted/40 border-l-4 border-muted-foreground" />
          Storniert
        </span>
      </div>
    </div>
  );
}

function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("Alle");
  const [appointmentsView, setAppointmentsView] = useState<"calendar" | "list">("calendar");
  const queryClient = useQueryClient();

  const { data: summary } = useGetDashboardSummary();
  const { data: upcoming } = useGetUpcomingAppointments();
  const { data: allAppointments } = useListAppointments({
    status: statusFilter !== "Alle" ? (statusFilter.toLowerCase() as any) : undefined,
  });

  const updateStatus = useUpdateAppointmentStatus();
  const cancelAppointment = useCancelAppointment();

  const upcomingList = Array.isArray(upcoming) ? upcoming : [];
  const allList = Array.isArray(allAppointments) ? allAppointments : [];

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetUpcomingAppointmentsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
  };

  const handleConfirm = (id: string) => {
    updateStatus.mutate(
      { id, data: { status: "confirmed" } },
      { onSuccess: invalidateAll }
    );
  };

  const handleCancel = (id: string) => {
    updateStatus.mutate(
      { id, data: { status: "cancelled" } },
      { onSuccess: invalidateAll }
    );
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    window.location.reload();
  };

  return (
    <PageTransition className="flex-1 max-w-7xl mx-auto w-full px-6 py-20">
      <header className="mb-14 flex items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <span className="h-px w-8 bg-primary" />
            <span className="text-[10px] uppercase tracking-[0.35em] font-bold">
              Interner Bereich
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight">
            MAINUSCH <span className="font-serif italic text-primary">verwaltung</span>
          </h1>
        </div>
        <button
          onClick={logout}
          className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-colors border border-foreground px-3 py-2"
        >
          Abmelden
        </button>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-foreground border-2 border-foreground mb-14">
        {[
          { label: "Heute", value: summary?.appointmentsToday ?? "–" },
          { label: "Diese Woche", value: summary?.appointmentsThisWeek ?? "–" },
          { label: "Anstehend", value: summary?.upcomingCount ?? "–" },
          {
            label: "Umsatz Woche",
            value: summary?.revenueThisWeekCents
              ? `€${summary.revenueThisWeekCents / 100}`
              : "–",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-background p-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 font-bold">
              {kpi.label}
            </div>
            <div className="font-display text-4xl">{kpi.value}</div>
          </div>
        ))}
      </section>

      <div className="grid md:grid-cols-3 gap-10 mb-14">
        {/* Top Service */}
        <section className="md:col-span-1">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-primary mb-5 pb-2 border-b-2 border-foreground font-bold">
            Top Service
          </h2>
          {summary?.topService ? (
            <div className="border-2 border-foreground bg-secondary p-6">
              <ScissorIcon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-serif text-2xl font-bold mb-2">
                {summary.topService.name}
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                {summary.topService.bookings} Buchungen
              </p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Noch keine Daten</div>
          )}
        </section>

        {/* Anstehend */}
        <section className="md:col-span-2">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-primary mb-5 pb-2 border-b-2 border-foreground font-bold">
            Anstehende Termine
          </h2>
          <div className="grid gap-px bg-foreground border-2 border-foreground">
            {upcomingList.map((apt) => (
              <div
                key={apt.id}
                className="bg-background p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="font-serif text-lg font-bold mb-1">
                    {apt.customerName}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 uppercase tracking-widest">
                    <span>
                      {format(new Date(apt.startsAt), "dd.MM.yyyy", { locale: de })}
                    </span>
                    <span>{format(new Date(apt.startsAt), "HH:mm")}</span>
                    <span>·</span>
                    <span>{apt.service?.name}</span>
                    <span>·</span>
                    <span>{apt.stylist?.name}</span>
                  </div>
                </div>
                {apt.status === "pending" && (
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleConfirm(apt.id)}
                      className="bg-foreground text-background uppercase tracking-[0.2em] text-[10px] font-bold px-4 py-2 hover:bg-primary transition-colors border-2 border-foreground"
                    >
                      Bestätigen
                    </button>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold hover:text-destructive transition-colors"
                    >
                      Ablehnen
                    </button>
                  </div>
                )}
                {apt.status === "confirmed" && (
                  <div className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold">
                    Bestätigt
                  </div>
                )}
              </div>
            ))}
            {upcomingList.length === 0 && (
              <div className="bg-background p-6 text-sm text-muted-foreground">
                Keine anstehenden Termine
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Alle Termine */}
      <section>
        <div className="flex items-center justify-between mb-5 pb-2 border-b-2 border-foreground gap-4 flex-wrap">
          <div className="flex items-center gap-6">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
              Alle Termine
            </h2>
            <div className="flex items-center gap-1 border border-foreground p-0.5">
              {(
                [
                  { value: "calendar", label: "Kalender" },
                  { value: "list", label: "Liste" },
                ] as const
              ).map((view) => (
                <button
                  key={view.value}
                  onClick={() => setAppointmentsView(view.value)}
                  data-testid={`button-view-${view.value}`}
                  className={`text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1 transition-colors ${
                    appointmentsView === view.value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
          {appointmentsView === "list" && (
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold">
              {["Alle", "Pending", "Bestätigt", "Storniert"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`transition-colors ${
                    statusFilter === status
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {appointmentsView === "calendar" ? (
          <WeekCalendar
            appointments={allList as Appointment[]}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        ) : (
        <div className="grid gap-px bg-foreground border-2 border-foreground">
          {allList.map((apt) => (
            <div
              key={apt.id}
              className="bg-background p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="font-serif text-lg font-bold mb-1">
                  {apt.customerName}
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 uppercase tracking-widest">
                  <span>{format(new Date(apt.startsAt), "dd.MM.yyyy")}</span>
                  <span>{format(new Date(apt.startsAt), "HH:mm")}</span>
                  <span>·</span>
                  <span>{apt.service?.name}</span>
                  <span>·</span>
                  <span>{apt.stylist?.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-[10px] uppercase tracking-[0.2em] font-bold">
                {apt.status === "pending" && (
                  <span className="text-muted-foreground">Ausstehend</span>
                )}
                {apt.status === "confirmed" && (
                  <span className="text-primary">Bestätigt</span>
                )}
                {apt.status === "cancelled" && (
                  <span className="text-destructive">Storniert</span>
                )}

                {apt.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleConfirm(apt.id)}
                      className="text-primary hover:underline"
                    >
                      Zusagen
                    </button>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="text-destructive hover:underline"
                    >
                      Absagen
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {allList.length === 0 && (
            <div className="bg-background p-6 text-sm text-muted-foreground">
              Keine Termine gefunden
            </div>
          )}
        </div>
        )}
      </section>
    </PageTransition>
  );
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setUnlocked(true);
      }
    } catch {}
  }, []);

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }
  return <Dashboard />;
}
