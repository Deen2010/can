import { PageTransition } from "@/components/layout";
import { useGetAppointment, useCancelAppointment, getGetAppointmentQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { ScissorIcon } from "@/components/scissor-icon";
import { useQueryClient } from "@tanstack/react-query";

export default function Buchung() {
  const { id } = useParams();
  const { data: appointment, isLoading } = useGetAppointment(id || "", {
    query: { enabled: !!id }
  });
  
  const queryClient = useQueryClient();
  const cancelAppointment = useCancelAppointment();

  const handleCancel = () => {
    if (!id) return;
    if (confirm("Möchten Sie diesen Termin wirklich stornieren?")) {
      cancelAppointment.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAppointmentQueryKey(id) });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <PageTransition className="flex-1 flex items-center justify-center">
        <div className="text-xs uppercase tracking-widest animate-pulse">Lade Bestätigung...</div>
      </PageTransition>
    );
  }

  if (!appointment) {
    return (
      <PageTransition className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-3xl mb-4">Termin nicht gefunden</h1>
        <Link href="/" className="text-primary text-sm uppercase tracking-widest hover:underline">
          Zurück zur Startseite
        </Link>
      </PageTransition>
    );
  }

  const isCancelled = appointment.status === "cancelled";

  return (
    <PageTransition className="flex-1 max-w-3xl mx-auto w-full px-6 py-24">
      <div className="border border-border bg-background relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary -translate-y-16 translate-x-16 rotate-45" />

        <div className="p-8 md:p-12 relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-secondary flex items-center justify-center border border-border">
              <ScissorIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Buchungsnummer</div>
              <div className="font-mono text-sm tracking-wider">{appointment.id.split("-")[0]}</div>
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl mb-2">
            {isCancelled ? (
              <><strong className="font-bold text-destructive">Termin</strong> <em className="italic">storniert</em></>
            ) : (
              <><strong className="font-bold">See you</strong> <em className="italic">soon.</em></>
            )}
          </h1>
          
          <p className="text-muted-foreground mb-12 max-w-md">
            {isCancelled 
              ? "Ihr Termin wurde erfolgreich abgesagt. Wir hoffen, Sie bald wieder bei uns begrüßen zu dürfen." 
              : `Hallo ${appointment.customerName.split(" ")[0]}, Ihr Termin bei ${appointment.stylist?.name} ist bestätigt. Wir freuen uns auf Sie.`
            }
          </p>

          <div className="grid md:grid-cols-2 gap-px bg-border border border-border mb-12">
            <div className="bg-secondary p-6">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Wann</div>
              <div className="font-serif text-2xl mb-1">
                {format(parseISO(appointment.startsAt), "dd. MMMM yyyy", { locale: de })}
              </div>
              <div className="text-muted-foreground">
                {format(parseISO(appointment.startsAt), "HH:mm")} Uhr
              </div>
            </div>
            <div className="bg-secondary p-6">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Was</div>
              <div className="font-serif text-2xl mb-1">
                {appointment.service?.name}
              </div>
              <div className="text-muted-foreground">
                {appointment.service?.durationMinutes} min
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-border">
            <Link href="/" className="text-xs uppercase tracking-widest hover:text-primary transition-colors">
              ← Zurück zur Startseite
            </Link>
            
            {!isCancelled && (
              <button 
                onClick={handleCancel}
                disabled={cancelAppointment.isPending}
                className="text-[10px] uppercase tracking-widest text-destructive hover:underline disabled:opacity-50"
              >
                Termin stornieren
              </button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
