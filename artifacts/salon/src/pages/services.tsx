import { PageTransition } from "@/components/layout";
import { useListServices } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function Services() {
  const { data: services, isLoading } = useListServices();

  const categories = services ? Array.from(new Set(services.map(s => s.category))) : [];

  return (
    <PageTransition className="flex-1 max-w-5xl mx-auto w-full px-6 py-24">
      <header className="mb-16">
        <h1 className="font-serif text-5xl md:text-6xl mb-6">
          <strong className="font-bold">Leistungen</strong> <em className="italic">& Preise</em>
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg">
          Klare Sache: ein Schnitt, oder Schnitt mit Bart. Ehrliche Preise, ehrliche Arbeit.
        </p>
      </header>

      {isLoading ? (
        <div className="animate-pulse space-y-12">
          {[1, 2].map(i => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-32 bg-border" />
              <div className="grid gap-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-24 w-full bg-secondary border border-border" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-20">
          {categories.map(category => (
            <section key={category}>
              <h2 className="text-sm font-medium uppercase tracking-widest text-primary mb-8 pb-4 border-b border-border">
                {category}
              </h2>
              <div className="grid gap-px bg-border border border-border">
                {services
                  ?.filter(s => s.category === category)
                  .map(service => (
                    <Link
                      key={service.id}
                      href={`/buchen?service=${service.id}`}
                      className="group block bg-background p-6 md:p-8 hover:bg-secondary transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="max-w-xl">
                          <h3 className="font-serif text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-8 md:text-right shrink-0">
                          <div className="text-sm">
                            <div className="uppercase tracking-widest text-muted-foreground text-xs mb-1">Dauer</div>
                            <div>{service.durationMinutes} Min</div>
                          </div>
                          <div className="text-sm">
                            <div className="uppercase tracking-widest text-muted-foreground text-xs mb-1">Preis</div>
                            <div>€ {service.priceCents / 100}</div>
                          </div>
                          <div className="hidden md:block">
                            <span className="text-xs uppercase tracking-widest font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              Buchen →
                            </span>
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
    </PageTransition>
  );
}
