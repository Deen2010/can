import { PageTransition } from "@/components/layout";
import { useListStylists } from "@workspace/api-client-react";
import { Link } from "wouter";
import { BarberPoleIcon, RazorIcon, ScissorIcon } from "@/components/scissor-icon";
import goodVibes from "@assets/WhatsApp_Image_2026-04-27_at_4.15.21_PM_1777299354495.jpeg";
import chillVibe from "@assets/WhatsApp_Image_2026-04-27_at_4.27.46_PM_1777304518213.jpeg";
import workCurly from "@assets/WhatsApp_Image_2026-04-27_at_4.10.09_PM_1777299203934.jpeg";
import workBeard from "@assets/WhatsApp_Image_2026-04-27_at_4.10.08_PM_1777299203936.jpeg";
import workFade from "@assets/WhatsApp_Image_2026-04-27_at_4.10.09_PM_(1)_1777299203937.jpeg";

export default function Stylists() {
  const { data: stylistsData } = useListStylists();
  const stylists = Array.isArray(stylistsData) ? stylistsData : [];
  const can = stylists[0];

  const specialties: string[] =
    can?.specialties && can.specialties.length > 0
      ? can.specialties
      : ["Skin Fade", "Bartpflege", "Locken", "Hot Towel Shave"];

  return (
    <PageTransition className="flex-1 flex flex-col">
      {/* HERO */}
      <section className="relative border-b-2 border-foreground bg-background overflow-hidden">
        <div className="absolute inset-0 vintage-paper opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-12 gap-12 items-center relative">
          <div className="md:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-primary">
              <span className="h-px w-10 bg-primary" />
              <span className="text-[10px] uppercase tracking-[0.35em] font-bold">
                Der Barber
              </span>
            </div>
            <h1 className="font-display text-6xl md:text-8xl leading-[0.85] tracking-tight">
              {can?.name?.toUpperCase() ?? "CAN"}
              <span className="block font-serif italic text-primary text-4xl md:text-5xl mt-3 leading-none">
                {can?.role ?? "Barber & Inhaber"}
              </span>
            </h1>
            <p className="text-foreground/80 text-base md:text-lg leading-relaxed max-w-md">
              {can?.bio ??
                "Ein Stuhl, ein Barber, volle Aufmerksamkeit. Spezialisiert auf saubere Schnitte, Skin Fades und Bartpflege im klassischen Stil."}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={can ? `/buchen?stylist=${can.id}` : "/buchen"}
                className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 font-bold text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors border-2 border-foreground"
              >
                Termin bei {can?.name ?? "Can"}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a
                href="https://instagram.com/can.v912"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-background text-foreground px-6 py-4 font-bold text-xs uppercase tracking-[0.25em] border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                @can.v912
              </a>
            </div>
          </div>

          <div className="md:col-span-7 relative">
            <div className="absolute -left-3 top-0 bottom-0 w-6 barber-pole hidden md:block border-2 border-foreground" />
            <div className="relative border-2 border-foreground bg-background p-3 md:ml-6">
              <img
                src={goodVibes}
                alt={`${can?.name ?? "Can"} im Salon`}
                className="w-full aspect-[4/5] md:aspect-[5/4] object-cover grayscale-[10%] contrast-110"
              />
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 border-2 border-foreground">
                <div className="font-display text-xl tracking-wider leading-none">EIN STUHL</div>
                <div className="font-serif italic text-xs leading-none mt-1">ein barber</div>
              </div>
              <div className="absolute -top-4 -left-4 hidden md:flex w-20 h-20 bg-foreground text-background items-center justify-center rotate-[-12deg] border-2 border-foreground">
                <div className="text-center">
                  <ScissorIcon className="w-7 h-7 mx-auto mb-1" />
                  <div className="text-[8px] uppercase tracking-widest">est. 26</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="bg-foreground text-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 text-primary">
              <span className="h-px w-10 bg-primary" />
              <span className="text-[10px] uppercase tracking-[0.35em] font-bold">
                Spezialgebiete
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.9] tracking-tight">
              SAUBERES<br />
              <span className="font-serif italic text-primary text-3xl md:text-5xl">
                handwerk.
              </span>
            </h2>
            <p className="text-background/80 leading-relaxed max-w-md">
              Klassische Technik trifft auf modernen Look. Was du brauchst, kriegst du —
              ohne Standardprogramm.
            </p>
          </div>
          <div className="md:col-span-7 grid sm:grid-cols-2 gap-px bg-background/30 border-2 border-background">
            {specialties.map((spec: string, i: number) => (
              <div key={spec} className="bg-foreground p-6 flex items-start gap-4">
                <span className="font-display text-2xl text-primary leading-none shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="font-serif text-xl font-bold mb-1">{spec}</div>
                  <RazorIcon className="w-4 h-4 text-primary mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-3 barber-stripes-thin" />
      </section>

      {/* WORK */}
      <section className="border-b-2 border-foreground bg-background relative">
        <div className="absolute inset-0 vintage-paper opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 text-primary mb-3">
                <span className="h-px w-10 bg-primary" />
                <span className="text-[10px] uppercase tracking-[0.35em] font-bold">
                  Cuts von Can
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-6xl leading-none tracking-tight">
                AUS DER <span className="font-serif italic text-primary">werkstatt.</span>
              </h2>
            </div>
            <a
              href="https://instagram.com/can.v912"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.25em] font-bold hover:text-primary transition-colors"
            >
              Mehr auf Instagram →
            </a>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { src: workCurly, label: "Locken · Tapered", num: "01" },
              { src: workBeard, label: "Schnitt · Bart", num: "02" },
              { src: workFade, label: "Skin Fade", num: "03" },
            ].map((item) => (
              <figure key={item.num} className="group">
                <div className="relative border-2 border-foreground bg-background p-2">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute top-3 right-3 bg-foreground text-background w-9 h-9 flex items-center justify-center font-display text-base">
                    {item.num}
                  </div>
                </div>
                <figcaption className="flex items-center justify-between mt-3 px-1">
                  <span className="font-bold text-xs uppercase tracking-[0.2em]">
                    {item.label}
                  </span>
                  <RazorIcon className="w-4 h-4 text-primary" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP VIBE */}
      <section className="relative bg-background border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6">
            <div className="border-2 border-foreground p-2 bg-background">
              <img
                src={chillVibe}
                alt="Goethe Cuts Werkstatt bei Nacht"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 text-primary">
              <BarberPoleIcon className="w-3 h-8 text-foreground" />
              <span className="text-[10px] uppercase tracking-[0.35em] font-bold">
                Wo es passiert
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl leading-[0.9] tracking-tight">
              KEIN SALON.<br />
              <span className="font-serif italic text-primary">eine werkstatt.</span>
            </h2>
            <p className="text-foreground/80 leading-relaxed max-w-md">
              Hinterhof, gutes Licht, Spiegel, Musik. Komm vorbei, hol dir 'nen frischen
              Schnitt und bleib für 'n Kaffee. Termin nach Vereinbarung.
            </p>
            <Link
              href={can ? `/buchen?stylist=${can.id}` : "/buchen"}
              className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 font-bold text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors border-2 border-foreground"
            >
              Jetzt Termin buchen →
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
