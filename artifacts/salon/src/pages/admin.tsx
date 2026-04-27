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
import { useEffect, useState } from "react";
import { format } from "date-fns";
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

function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("Alle");
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
        <div className="flex items-center justify-between mb-5 pb-2 border-b-2 border-foreground">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
            Alle Termine
          </h2>
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
        </div>

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
