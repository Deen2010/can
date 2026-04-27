import { PageTransition } from "@/components/layout";
import { useListServices } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ScissorIcon, RazorIcon } from "@/components/scissor-icon";

export default function Services() {
  const { data: servicesData, isLoading } = useListServices();
  const services = Array.isArray(servicesData) ? servicesData : [];
  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <PageTransition className="flex-1 flex flex-col">
      {/* HEADER */}
      <section className="relative border-b-2 border-foreground bg-background overflow-hidden">
        <div className="absolute inset-0 vintage-paper opacity-50 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24 relative">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <span className="h-px w-10 bg-primary" />
            <span className="text-[10px] uppercase tracking-[0.35em] font-bold">
              House Specials
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.85] tracking-tight">
            CUTS &amp;{" "}
            <span className="font-serif italic text-primary text-5xl md:text-7xl">
              preise.
            </span>
          </h1>
          <p className="mt-6 text-foreground/80 max-w-xl text-base md:text-lg leading-relaxed">
            Klare Sache: ein Schnitt, oder Schnitt mit Bart. Ehrliche Preise, ehrliche Arbeit.
            Cash und Karte gehen beide klar.
          </p>
        </div>
        <div className="h-3 barber-stripes-thin border-t-2 border-foreground" />
      </section>

      {/* PRICE LIST */}
      <section className="flex-1 bg-background">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          {isLoading && services.length === 0 ? (
            <div className="animate-pulse space-y-12">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 w-32 bg-border" />
                  <div className="grid gap-4">
                    {[1, 2].map((j) => (
                      <div key={j} className="h-24 w-full bg-secondary border-2 border-foreground" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {categories.map((category) => (
                <section key={category}>
                  <div className="flex items-center gap-4 mb-8">
                    <ScissorIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.35em] text-foreground">
                      {category}
                    </h2>
                    <span className="flex-1 h-px bg-foreground" />
                  </div>
                  <div className="grid gap-px bg-foreground border-2 border-foreground">
                    {services
                      .filter((s) => s.category === category)
                      .map((service, i) => (
                        <Link
                          key={service.id}
                          href={`/buchen?service=${service.id}`}
                          className="group block bg-background p-6 md:p-8 hover:bg-secondary transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-5 max-w-xl">
                              <span className="font-display text-3xl text-primary leading-none shrink-0">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <div>
                                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                                  {service.name}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                  {service.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8 md:text-right shrink-0 pl-12 md:pl-0">
                              <div className="text-sm">
                                <div className="uppercase tracking-[0.25em] text-muted-foreground text-[10px] font-bold mb-1">
                                  Dauer
                                </div>
                                <div className="font-serif">{service.durationMinutes} Min</div>
                              </div>
                              <div className="text-sm">
                                <div className="uppercase tracking-[0.25em] text-muted-foreground text-[10px] font-bold mb-1">
                                  Preis
                                </div>
                                <div className="font-display text-3xl text-primary leading-none">
                                  €{service.priceCents / 100}
                                </div>
                              </div>
                              <div className="hidden md:block">
                                <RazorIcon className="w-5 h-5 text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-20 text-center border-t-2 border-foreground pt-12">
            <p className="font-serif italic text-lg text-muted-foreground mb-6">
              Trinkgeld geht klar · Walk-In nach Verfügbarkeit
            </p>
            <Link
              href="/buchen"
              className="inline-flex items-center gap-3 bg-foreground text-background px-10 py-5 font-bold text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors border-2 border-foreground"
            >
              Jetzt Termin buchen →
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
