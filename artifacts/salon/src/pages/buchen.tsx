import { PageTransition } from "@/components/layout";
import { 
  useListServices, 
  useListStylists, 
  useGetAvailability, 
  useCreateAppointment,
  getGetDashboardSummaryQueryKey,
  getGetUpcomingAppointmentsQueryKey,
  getListAppointmentsQueryKey,
  getGetAvailabilityQueryKey
} from "@workspace/api-client-react";
import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { format, addDays, isBefore, startOfToday, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAppointmentBody } from "@workspace/api-zod";
import { useQueryClient } from "@tanstack/react-query";
import { ScissorIcon } from "@/components/scissor-icon";
import * as z from "zod";

const FormSchema = CreateAppointmentBody.omit({ serviceId: true, stylistId: true, startsAt: true });

export default function Buchen() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const queryParams = new URLSearchParams(searchString);
  
  const queryClient = useQueryClient();

  const initialService = queryParams.get("service");
  const initialStylist = queryParams.get("stylist");

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(initialService);
  const [stylistId, setStylistId] = useState<string | null>(initialStylist);
  const [dateStr, setDateStr] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState<string | null>(null); // ISO string of startsAt

  const { data: services } = useListServices();
  const { data: stylists } = useListStylists();

  const { data: availability } = useGetAvailability(
    { serviceId: serviceId!, stylistId: stylistId!, date: dateStr! },
    { query: { enabled: !!(serviceId && stylistId && dateStr) } }
  );

  const createAppointment = useCreateAppointment();

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema)
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (!serviceId || !stylistId || !timeStr) return;

    createAppointment.mutate({
      data: {
        ...data,
        serviceId,
        stylistId,
        startsAt: timeStr,
      }
    }, {
      onSuccess: (res) => {
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetUpcomingAppointmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAvailabilityQueryKey({ serviceId, stylistId, date: dateStr! }) });

        setLocation(`/buchung/${res.id}`);
      }
    });
  };

  const today = startOfToday();
  const dates = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => addDays(today, i));
  }, [today]);

  const selectedService = services?.find(s => s.id === serviceId);
  const selectedStylist = stylists?.find(s => s.id === stylistId);

  return (
    <PageTransition className="flex-1 max-w-4xl mx-auto w-full px-6 py-24">
      
      {/* Stepper */}
      <div className="flex items-center justify-between border-b border-border pb-6 mb-16">
        {[
          { num: 1, label: "Service" },
          { num: 2, label: "Stylist:in" },
          { num: 3, label: "Zeit" },
          { num: 4, label: "Details" }
        ].map((s) => (
          <div key={s.num} className={`text-xs uppercase tracking-widest flex items-center gap-2 ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}>
            <span className="font-serif italic text-lg">{s.num}</span>
            <span className="hidden md:inline">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          
          {/* STEP 1: SERVICE */}
          {step === 1 && (
            <PageTransition>
              <h2 className="font-serif text-4xl mb-8">Service wählen</h2>
              <div className="grid gap-px bg-border border border-border">
                {services?.map(service => (
                  <button
                    key={service.id}
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

          {/* STEP 2: STYLIST */}
          {step === 2 && (
            <PageTransition>
              <button onClick={() => setStep(1)} className="text-xs uppercase tracking-widest text-muted-foreground mb-4 hover:text-primary">← Zurück</button>
              <h2 className="font-serif text-4xl mb-8">Stylist:in wählen</h2>
              <div className="grid gap-px bg-border border border-border">
                {stylists?.map(stylist => (
                  <button
                    key={stylist.id}
                    onClick={() => {
                      setStylistId(stylist.id);
                      setStep(3);
                    }}
                    className={`w-full text-left p-6 bg-background hover:bg-secondary transition-colors flex gap-6 items-center ${stylistId === stylist.id ? "bg-secondary" : ""}`}
                  >
                    <div className="w-16 h-16 bg-secondary border border-border overflow-hidden shrink-0">
                      <img src={stylist.imageUrl || ""} alt="" className="w-full h-full object-cover grayscale" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold mb-1">{stylist.name}</h3>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{stylist.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </PageTransition>
          )}

          {/* STEP 3: ZEIT */}
          {step === 3 && (
            <PageTransition>
              <button onClick={() => setStep(2)} className="text-xs uppercase tracking-widest text-muted-foreground mb-4 hover:text-primary">← Zurück</button>
              <h2 className="font-serif text-4xl mb-8">Datum & Uhrzeit</h2>
              
              <div className="mb-8">
                <label className="text-xs uppercase tracking-widest block mb-4">1. Datum wählen</label>
                <div className="flex overflow-x-auto pb-4 gap-2 border-b border-border snap-x">
                  {dates.map(date => {
                    const dateString = format(date, "yyyy-MM-dd");
                    const isSelected = dateStr === dateString;
                    return (
                      <button
                        key={dateString}
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
                    )
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
                            disabled={!isAvailable}
                            onClick={() => {
                              setTimeStr(slot.startsAt);
                              setStep(4);
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

          {/* STEP 4: DETAILS */}
          {step === 4 && (
            <PageTransition>
              <button onClick={() => setStep(3)} className="text-xs uppercase tracking-widest text-muted-foreground mb-4 hover:text-primary">← Zurück</button>
              <h2 className="font-serif text-4xl mb-8">Kontaktdaten</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="text-xs uppercase tracking-widest block mb-2">Name</label>
                  <input 
                    {...register("customerName")}
                    className="w-full bg-input border-b border-border focus:border-primary outline-none px-4 py-3 font-sans transition-colors"
                    placeholder="Vor- und Nachname"
                  />
                  {errors.customerName && <span className="text-xs text-destructive mt-1 block">{errors.customerName.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest block mb-2">Email</label>
                    <input 
                      {...register("customerEmail")}
                      className="w-full bg-input border-b border-border focus:border-primary outline-none px-4 py-3 font-sans transition-colors"
                      placeholder="email@example.com"
                      type="email"
                    />
                    {errors.customerEmail && <span className="text-xs text-destructive mt-1 block">{errors.customerEmail.message}</span>}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest block mb-2">Telefon</label>
                    <input 
                      {...register("customerPhone")}
                      className="w-full bg-input border-b border-border focus:border-primary outline-none px-4 py-3 font-sans transition-colors"
                      placeholder="+49 ..."
                      type="tel"
                    />
                    {errors.customerPhone && <span className="text-xs text-destructive mt-1 block">{errors.customerPhone.message}</span>}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest block mb-2">Notizen (Optional)</label>
                  <textarea 
                    {...register("notes")}
                    className="w-full bg-input border-b border-border focus:border-primary outline-none px-4 py-3 font-sans transition-colors min-h-[100px] resize-none"
                    placeholder="Besondere Wünsche..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={createAppointment.isPending}
                  className="w-full bg-destructive text-white uppercase tracking-widest text-sm font-medium py-4 hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {createAppointment.isPending ? "Wird gebucht..." : "Verbindlich Buchen"}
                </button>
              </form>
            </PageTransition>
          )}

        </div>

        {/* SUMMARY COLUMN */}
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
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Service</div>
                {selectedService ? (
                  <div>
                    <div className="font-serif text-lg">{selectedService.name}</div>
                    <div className="text-muted-foreground mt-1">{selectedService.durationMinutes} min · € {selectedService.priceCents / 100}</div>
                  </div>
                ) : (
                  <div className="text-hint italic">Noch nicht gewählt</div>
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Stylist:in</div>
                {selectedStylist ? (
                  <div className="font-serif text-lg">{selectedStylist.name}</div>
                ) : (
                  <div className="text-hint italic">Noch nicht gewählt</div>
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Zeit</div>
                {timeStr ? (
                  <div>
                    <div className="font-serif text-lg">{format(parseISO(timeStr), "dd.MM.yyyy", { locale: de })}</div>
                    <div className="text-muted-foreground mt-1">{format(parseISO(timeStr), "HH:mm")} Uhr</div>
                  </div>
                ) : (
                  <div className="text-hint italic">Noch nicht gewählt</div>
                )}
              </div>
            </div>

            {selectedService && selectedStylist && timeStr && (
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest">Total</span>
                  <span className="font-serif text-2xl text-primary">€ {selectedService.priceCents / 100}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </PageTransition>
  );
}
