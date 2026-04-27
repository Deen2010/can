import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { format, parseISO, isPast } from "date-fns";
import { de } from "date-fns/locale";
import { PageTransition } from "@/components/layout";
import { ScissorIcon } from "@/components/scissor-icon";
import {
  useListAppointments,
  useCancelAppointment,
  getListAppointmentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

export default function MeineTermine() {
  const [, setLocation] = useLocation();
  const { customer, isLoading, logout } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !customer) {
      setLocation("/login?next=/meine-termine");
    }
  }, [isLoading, customer, setLocation]);

  const { data, isLoading: listLoading } = useListAppointments(
    { mine: true },
    { query: { enabled: !!customer } },
  );
  const cancel = useCancelAppointment();
  const appointments = Array.isArray(data) ? data : [];

  const upcoming = appointments.filter(
    (a) => a.status !== "cancelled" && !isPast(parseISO(a.startsAt)),
  );
  const past = appointments.filter(
    (a) => a.status === "cancelled" || isPast(parseISO(a.startsAt)),
  );

  const onCancel = async (id: string) => {
    if (!confirm("Termin wirklich absagen?")) return;
    await cancel.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
  };

  if (isLoading || !customer) {
    return (
      <PageTransition className="flex-1 max-w-3xl mx-auto w-full px-6 py-24 text-center text-sm text-muted-foreground">
        Lade...
      </PageTransition>
    );
  }

  return (
    <PageTransition className="flex-1 max-w-3xl mx-auto w-full px-6 py-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b-2 border-foreground pb-6 mb-12">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2">Mein Konto</div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-[0.12em] sm:tracking-[0.15em] break-words">
            HI, {customer.name.toUpperCase()}
          </h1>
          <p className="font-serif italic text-sm text-muted-foreground mt-2 break-all">
            {customer.email}
          </p>
        </div>
        <button
          onClick={async () => {
            await logout();
            setLocation("/");
          }}
          className="self-start sm:self-auto text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-primary border border-border sm:border-0 px-3 py-2 sm:px-0 sm:py-0"
        >
          Ausloggen
        </button>
      </div>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <ScissorIcon className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-2xl">Kommende Termine</h2>
        </div>

        {listLoading ? (
          <div className="text-sm text-muted-foreground">Lade...</div>
        ) : upcoming.length === 0 ? (
          <div className="border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">Keine kommenden Termine.</p>
            <Link
              href="/buchen"
              className="inline-block bg-destructive text-white uppercase tracking-widest text-xs px-6 py-3 hover:bg-destructive/90"
            >
              Termin buchen
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="border border-border bg-secondary p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="font-serif text-xl">
                    {format(parseISO(a.startsAt), "EEEE, dd. MMMM", { locale: de })}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {format(parseISO(a.startsAt), "HH:mm")} Uhr ·{" "}
                    {a.service?.name ?? "Service"} · {a.stylist?.name ?? "Barber"}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest mt-2">
                    Status:{" "}
                    <span
                      className={
                        a.status === "confirmed"
                          ? "text-green-700"
                          : "text-amber-700"
                      }
                    >
                      {a.status === "confirmed" ? "Bestätigt" : "Anfrage"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onCancel(a.id)}
                  disabled={cancel.isPending}
                  className="text-[10px] uppercase tracking-[0.25em] border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 self-start sm:self-center"
                >
                  Absagen
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-serif text-2xl text-muted-foreground">Vergangene Termine</h2>
          </div>
          <ul className="space-y-2">
            {past.map((a) => (
              <li
                key={a.id}
                className="border-b border-border py-3 flex justify-between items-center text-sm"
              >
                <div>
                  <span className="font-serif">
                    {format(parseISO(a.startsAt), "dd.MM.yyyy", { locale: de })}
                  </span>
                  <span className="text-muted-foreground ml-3">
                    {a.service?.name ?? "Service"}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {a.status === "cancelled" ? "Abgesagt" : "Erledigt"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageTransition>
  );
}
