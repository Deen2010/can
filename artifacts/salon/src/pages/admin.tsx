import { PageTransition } from "@/components/layout";
import { 
  useGetDashboardSummary, 
  useGetUpcomingAppointments, 
  useListAppointments,
  useUpdateAppointmentStatus,
  useCancelAppointment,
  getGetDashboardSummaryQueryKey,
  getGetUpcomingAppointmentsQueryKey,
  getListAppointmentsQueryKey
} from "@workspace/api-client-react";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const [statusFilter, setStatusFilter] = useState<string>("Alle");
  const queryClient = useQueryClient();

  const { data: summary } = useGetDashboardSummary();
  const { data: upcoming } = useGetUpcomingAppointments();
  const { data: allAppointments } = useListAppointments({ 
    status: statusFilter !== "Alle" ? (statusFilter.toLowerCase() as any) : undefined 
  });

  const updateStatus = useUpdateAppointmentStatus();
  const cancelAppointment = useCancelAppointment();

  const handleConfirm = (id: string) => {
    updateStatus.mutate(
      { id, data: { status: "confirmed" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetUpcomingAppointmentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        }
      }
    );
  };

  const handleCancel = (id: string) => {
    updateStatus.mutate(
      { id, data: { status: "cancelled" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetUpcomingAppointmentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        }
      }
    );
  };

  return (
    <PageTransition className="flex-1 max-w-7xl mx-auto w-full px-6 py-24">
      <header className="mb-16">
        <h1 className="font-serif text-5xl mb-2">
          <strong className="font-bold">Studio</strong> <em className="italic">Verwaltung</em>
        </h1>
        <p className="text-muted-foreground uppercase tracking-widest text-xs">Back Office</p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-16">
        <div className="bg-background p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Heute</div>
          <div className="font-serif text-4xl">{summary?.appointmentsToday ?? "-"}</div>
        </div>
        <div className="bg-background p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Diese Woche</div>
          <div className="font-serif text-4xl">{summary?.appointmentsThisWeek ?? "-"}</div>
        </div>
        <div className="bg-background p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Anstehend</div>
          <div className="font-serif text-4xl">{summary?.upcomingCount ?? "-"}</div>
        </div>
        <div className="bg-background p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Umsatz Woche</div>
          <div className="font-serif text-4xl">
            {summary?.revenueThisWeekCents ? `€ ${summary.revenueThisWeekCents / 100}` : "-"}
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-12 mb-16">
        {/* Top Service */}
        <section className="md:col-span-1">
          <h2 className="text-xs uppercase tracking-widest text-primary mb-6 pb-2 border-b border-border">
            Top Service
          </h2>
          {summary?.topService ? (
            <div className="bg-secondary p-6 border border-border">
              <h3 className="font-serif text-2xl font-bold mb-2">{summary.topService.name}</h3>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">
                {summary.topService.bookings} Buchungen
              </p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Keine Daten verfügbar</div>
          )}
        </section>

        {/* Anstehend */}
        <section className="md:col-span-2">
          <h2 className="text-xs uppercase tracking-widest text-primary mb-6 pb-2 border-b border-border">
            Anstehende Termine
          </h2>
          <div className="grid gap-px bg-border border border-border">
            {upcoming?.map(apt => (
              <div key={apt.id} className="bg-background p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="font-serif text-xl font-bold mb-1">{apt.customerName}</div>
                  <div className="text-sm text-muted-foreground flex gap-3">
                    <span>{format(new Date(apt.startsAt), "dd.MM.yyyy", { locale: de })}</span>
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
                      className="bg-destructive text-white uppercase tracking-widest text-xs px-4 py-2 hover:bg-destructive/90 transition-colors"
                    >
                      Bestätigen
                    </button>
                    <button 
                      onClick={() => handleCancel(apt.id)}
                      className="text-muted-foreground uppercase tracking-widest text-xs hover:text-foreground transition-colors"
                    >
                      Ablehnen
                    </button>
                  </div>
                )}
                {apt.status === "confirmed" && (
                  <div className="text-xs uppercase tracking-widest text-primary">Bestätigt</div>
                )}
              </div>
            ))}
            {(!upcoming || upcoming.length === 0) && (
              <div className="bg-background p-6 text-sm text-muted-foreground">
                Keine anstehenden Termine
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Alle Termine */}
      <section>
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
          <h2 className="text-xs uppercase tracking-widest text-primary">
            Alle Termine
          </h2>
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest">
            {["Alle", "Pending", "Bestätigt", "Storniert"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`transition-colors ${statusFilter === status ? "text-primary border-b border-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-px bg-border border border-border">
          {allAppointments?.map(apt => (
            <div key={apt.id} className="bg-background p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-serif text-xl font-bold mb-1">{apt.customerName}</div>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                  <span>{format(new Date(apt.startsAt), "dd.MM.yyyy")}</span>
                  <span>{format(new Date(apt.startsAt), "HH:mm")}</span>
                  <span>·</span>
                  <span>{apt.service?.name}</span>
                  <span>·</span>
                  <span>{apt.stylist?.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-xs uppercase tracking-widest">
                {apt.status === "pending" && <span className="text-muted-foreground">Ausstehend</span>}
                {apt.status === "confirmed" && <span className="text-primary">Bestätigt</span>}
                {apt.status === "cancelled" && <span className="text-destructive">Storniert</span>}
                
                {apt.status === "pending" && (
                  <>
                    <button onClick={() => handleConfirm(apt.id)} className="text-primary hover:underline">Zusagen</button>
                    <button onClick={() => handleCancel(apt.id)} className="text-destructive hover:underline">Absagen</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {(!allAppointments || allAppointments.length === 0) && (
            <div className="bg-background p-6 text-sm text-muted-foreground">
              Keine Termine gefunden
            </div>
          )}
        </div>
      </section>

    </PageTransition>
  );
}
