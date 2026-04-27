import { PageTransition } from "@/components/layout";
import {
  useListServices,
  useListStylists,
  useGetAvailability,
  useCreateAppointment,
  getGetDashboardSummaryQueryKey,
  getGetUpcomingAppointmentsQueryKey,
  getListAppointmentsQueryKey,
  getGetAvailabilityQueryKey,
} from "@workspace/api-client-react";
import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { format, addDays, startOfToday, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { ScissorIcon, BarberPoleIcon } from "@/components/scissor-icon";
import { useAuth } from "@/lib/auth";

interface ContactForm {
  notes?: string;
}

function LoginGate({ nextPath }: { nextPath: string }) {
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <PageTransition className="flex-1 max-w-3xl mx-auto w-full px-6 py-24">
      <div className="border-2 border-foreground bg-background relative overflow-hidden">
        <div className="h-3 barber-stripes-thin border-b-2 border-foreground" />
        <div className="p-10 md:p-14 text-center">
          <BarberPoleIcon className="w-6 h-16 text-foreground mx-auto mb-6" />
          <div className="text-[10px] uppercase tracking-[0.35em] text-primary font-bold mb-3">
            Termin buchen
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-4">
            Bitte einloggen
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-10">
            Damit dein Termin verbindlich gespeichert wird und du ihn jederzeit
            wiederfindest, brauchen wir dich kurz angemeldet. Dauert keine
            Minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={loginHref}
              data-testid="link-gate-login"
              className="group inline-flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 font-bold text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors border-2 border-foreground"
            >
              Einloggen
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <Link
              href={loginHref}
              data-testid="link-gate-register"
              className="inline-flex items-center justify-center gap-3 bg-background text-foreground px-8 py-4 font-bold text-xs uppercase tracking-[0.25em] border-2 border-foreground hover:bg-secondary transition-colors"
            >
              Konto anlegen
            </Link>
          </div>
        </div>
        <div className="h-3 barber-stripes-thin border-t-2 border-foreground" />
      </div>
    </PageTransition>
  );
}

export default function Buchen() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const queryParams = new URLSearchParams(searchString);

  const queryClient = useQueryClient();
  const { customer, isLoading: authLoading } = useAuth();

  const initialService = queryParams.get("service");

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(initialService);
  const [dateStr, setDateStr] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: servicesData } = useListServices();
  const { data: stylistsData } = useListStylists();
  const services = Array.isArray(servicesData) ? servicesData : [];
  const stylists = Array.isArray(stylistsData) ? stylistsData : [];

  // Single-barber shop: always book with the only stylist available.
  const stylistId = stylists[0]?.id ?? null;
  const selectedStylist = stylists[0] ?? null;

  const { data: availability } = useGetAvailability(
    { serviceId: serviceId!, stylistId: stylistId!, date: dateStr! },
    { query: { enabled: !!(serviceId && stylistId && dateStr) } },
  );

  const createAppointment = useCreateAppointment();

  const {
    register,
    handleSubmit,
  } = useForm<ContactForm>({
    defaultValues: { notes: "" },
  });

  const onSubmit = async (data: ContactForm) => {
    if (!serviceId || !stylistId || !timeStr || !customer) return;
    setSubmitError(null);

    try {
      const res = await createAppointment.mutateAsync({
        data: {
          serviceId,
          stylistId,
          startsAt: timeStr,
          notes: data.notes || undefined,
        },
      });

      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetUpcomingAppointmentsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
      queryClient.invalidateQueries({
        queryKey: getGetAvailabilityQueryKey({ serviceId, stylistId, date: dateStr! }),
      });

      setLocation(`/buchung/${res.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Buchung fehlgeschlagen";
      setSubmitError(msg);
    }
  };

  // If a service was preselected via query param and step is still 1, jump forward
  useEffect(() => {
    if (serviceId && step === 1 && services.find((s) => s.id === serviceId)) {
      setStep(2);
    }
  }, [serviceId, services, step]);

  const today = startOfToday();
  const dates = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => addDays(today, i));
  }, [today]);

  const selectedService = services.find((s) => s.id === serviceId);

  // Auth gate
  if (authLoading) {
    return (
      <PageTransition className="flex-1 max-w-3xl mx-auto w-full px-6 py-32 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Lade...
        </div>
      </PageTransition>
    );
  }

  if (!customer) {
    return <LoginGate nextPath="/buchen" />;
  }

  return (
    <PageTransition className="flex-1 max-w-4xl mx-auto w-full px-6 py-24">
      {/* Stepper — 3 steps now (no Friseur step) */}
      <div className="flex items-center justify-between border-b border-border pb-6 mb-16">
        {[
          { num: 1, label: "Leistung" },
          { num: 2, label: "Zeit" },
          { num: 3, label: "Details" },
        ].map((s) => (
          <div
            key={s.num}
            className={`text-xs uppercase tracking-widest flex items-center gap-2 ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}
          >
            <span className="font-serif italic text-lg">{s.num}</span>
            <span className="hidden md:inline">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          {step === 1 && (
            <PageTransition>
              <h2 className="font-serif text-4xl mb-8">Leistung wählen</h2>
              <div className="grid gap-px bg-border border border-border">
                {services.map((service) => (
                  <button
                    key={service.id}
                    data-testid={`button-service-${service.id}`}
                    onClick={() => {
                      setServiceId(service.id);
                      setStep(2);
                    }}
                    className={`w-full text-left p-6 bg-background hover:bg-secondary transition-colors ${serviceId === service.id ? "bg-secondary" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-2xl font-bold mb-1">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="text-right text-xs uppercase tracking-widest shrink-0">
                        <div>{service.durationMinutes} min</div>
                        <div className="mt-1 text-primary">€ {service.priceCents / 100}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </PageTransition>
          )}

          {step === 2 && (
            <PageTransition>
              <button
                onClick={() => setStep(1)}
                className="text-xs uppercase tracking-widest text-muted-foreground mb-4 hover:text-primary"
                data-testid="button-back-to-service"
              >
                ← Zurück
              </button>
              <h2 className="font-serif text-4xl mb-8">Datum & Uhrzeit</h2>

              <div className="mb-8">
                <label className="text-xs uppercase tracking-widest block mb-4">1. Datum wählen</label>
                <div className="flex overflow-x-auto pb-4 gap-2 border-b border-border snap-x">
                  {dates.map((date) => {
                    const dateString = format(date, "yyyy-MM-dd");
                    const isSelected = dateStr === dateString;
                    return (
                      <button
                        key={dateString}
                        data-testid={`button-date-${dateString}`}
                        onClick={() => {
                          setDateStr(dateString);
                          setTimeStr(null);
                        }}
                        className={`snap-start shrink-0 w-20 py-4 border transition-colors flex flex-col items-center justify-center ${isSelected ? "border-primary bg-primary text-white" : "border-border bg-background hover:bg-secondary"}`}
                      >
                        <span className="text-[10px] uppercase tracking-widest mb-1">{format(date, "eee", { locale: de })}</span>
                        <span className="font-serif text-xl">{format(date, "dd")}</span>
                        <span className="text-[10px] uppercase tracking-widest mt-1">{format(date, "MMM", { locale: de })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {dateStr && (
                <div>
                  <label className="text-xs uppercase tracking-widest block mb-4">2. Uhrzeit wählen</label>
                  {!availability ? (
                    <div className="text-sm text-muted-foreground">Lade Verfügbarkeiten...</div>
                  ) : (
                    <div className="grid grid-cols-4 gap-px bg-border border border-border">
                      {availability.slots.map((slot, i) => {
                        const isAvailable = slot.available;
                        const isSelected = timeStr === slot.startsAt;
                        return (
                          <button
                            key={i}
                            data-testid={`button-slot-${i}`}
                            disabled={!isAvailable}
                            onClick={() => {
                              setTimeStr(slot.startsAt);
                              setStep(3);
                            }}
                            className={`p-4 text-center text-sm transition-colors ${
                              !isAvailable
                                ? "bg-background/50 text-hint line-through cursor-not-allowed"
                                : isSelected
                                  ? "bg-primary text-white"
                                  : "bg-background hover:bg-secondary text-foreground"
                            }`}
                          >
                            {format(parseISO(slot.startsAt), "HH:mm")}
                          </button>
                        );
                      })}
                      {availability.slots.length === 0 && (
                        <div className="col-span-4 p-6 text-sm text-center text-muted-foreground bg-background">
                          Keine Termine an diesem Tag verfügbar.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </PageTransition>
          )}

          {step === 3 && (
            <PageTransition>
              <button
                onClick={() => setStep(2)}
                className="text-xs uppercase tracking-widest text-muted-foreground mb-4 hover:text-primary"
                data-testid="button-back-to-time"
              >
                ← Zurück
              </button>

              <h2 className="font-serif text-4xl mb-2">Bestätigen</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Eingeloggt als{" "}
                <span className="text-foreground font-medium">{customer.name}</span> ·{" "}
                {customer.email}
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="text-xs uppercase tracking-widest block mb-2">Notizen (Optional)</label>
                  <textarea
                    {...register("notes")}
                    data-testid="input-notes"
                    className="w-full bg-input border-b border-border focus:border-primary outline-none px-4 py-3 font-sans transition-colors min-h-[100px] resize-none"
                    placeholder="Besondere Wünsche..."
                  />
                </div>

                {submitError && (
                  <div className="text-xs text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createAppointment.isPending}
                  data-testid="button-submit-booking"
                  className="w-full bg-destructive text-white uppercase tracking-widest text-sm font-medium py-4 hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {createAppointment.isPending ? "Wird gebucht..." : "Verbindlich buchen"}
                </button>

                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                  Du findest deinen Termin danach unter „Meine Termine".
                </p>
              </form>
            </PageTransition>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-32 border border-border bg-secondary p-8">
            <div className="flex justify-center mb-6">
              <ScissorIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xs uppercase tracking-widest text-center border-b border-border pb-4 mb-6">
              Buchungsübersicht
            </h3>

            <div className="space-y-6 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Service
                </div>
                {selectedService ? (
                  <div>
                    <div className="font-serif text-lg">{selectedService.name}</div>
                    <div className="text-muted-foreground mt-1">
                      {selectedService.durationMinutes} min · € {selectedService.priceCents / 100}
                    </div>
                  </div>
                ) : (
                  <div className="text-hint italic">Noch nicht gewählt</div>
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Barber
                </div>
                {selectedStylist ? (
                  <div className="font-serif text-lg">{selectedStylist.name}</div>
                ) : (
                  <div className="text-hint italic">–</div>
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Zeit
                </div>
                {timeStr ? (
                  <div>
                    <div className="font-serif text-lg">
                      {format(parseISO(timeStr), "dd.MM.yyyy", { locale: de })}
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {format(parseISO(timeStr), "HH:mm")} Uhr
                    </div>
                  </div>
                ) : (
                  <div className="text-hint italic">Noch nicht gewählt</div>
                )}
              </div>
            </div>

            {selectedService && timeStr && (
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest">Total</span>
                  <span className="font-serif text-2xl text-primary">
                    € {selectedService.priceCents / 100}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
