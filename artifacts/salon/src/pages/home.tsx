import { PageTransition } from "@/components/layout";
import { Link } from "wouter";
import { ScissorIcon, BarberPoleIcon, RazorIcon } from "@/components/scissor-icon";
import workCurly from "@assets/WhatsApp_Image_2026-04-27_at_4.10.09_PM_1777299203934.jpeg";
import workBeard from "@assets/WhatsApp_Image_2026-04-27_at_4.10.08_PM_1777299203936.jpeg";
import workFade from "@assets/WhatsApp_Image_2026-04-27_at_4.10.09_PM_(1)_1777299203937.jpeg";
import goodVibes from "@assets/WhatsApp_Image_2026-04-27_at_4.15.21_PM_1777299354495.jpeg";
import chillVibe from "@assets/WhatsApp_Image_2026-04-27_at_4.27.46_PM_1777304518213.jpeg";

export default function Home() {
  return (
    <PageTransition className="flex-1 flex flex-col">
      {/* HERO — Old-school barbershop poster */}
      <section className="relative border-b-2 border-foreground bg-background overflow-hidden">
        <div className="absolute inset-0 vintage-paper opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 relative">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-7 space-y-8">
              {/* Marquee tag */}
              <div className="inline-flex items-center gap-3 border-2 border-foreground px-4 py-1.5 bg-background">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                  Walk-In · After Dark · Mainusch Block
                </span>
              </div>

              <h1 className="font-display tracking-tight">
                <span className="block text-foreground text-7xl md:text-9xl leading-[0.85] tracking-[0.02em]">
                  CUTS
                </span>
                <span className="block font-serif italic text-primary text-5xl md:text-7xl mt-2 leading-none">
                  &amp; close shaves
                </span>
                <span className="block text-foreground text-6xl md:text-8xl leading-[0.85] mt-3">
                  SINCE <span className="text-primary">2026</span>
                </span>
              </h1>

              <div className="flex items-start gap-5">
                <div className="hidden sm:block w-12 h-1 bg-foreground mt-3" />
                <p className="text-base md:text-lg text-foreground/80 max-w-md leading-relaxed">
                  Ein Stuhl. Ein Barber. Klassische Schnitte, Bartpflege und Hot-Towel-Service —
                  ohne Schnickschnack, mit ehrlichem Handwerk.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/buchen"
                  className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 font-bold text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors border-2 border-foreground"
                >
                  Termin buchen
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 font-bold text-xs uppercase tracking-[0.25em] border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                  Cuts & Preise
                </Link>
              </div>
            </div>

            {/* Hero image with barber pole sidebar */}
            <div className="md:col-span-5">
              <div className="relative">
                <div className="absolute -left-3 top-0 bottom-0 w-6 barber-pole hidden md:block border-2 border-foreground" />
                <div className="relative border-2 border-foreground bg-background p-3 md:ml-6">
                  <img
                    src={goodVibes}
                    alt="Schnitt von Can im Salon"
                    className="w-full aspect-[4/5] object-cover grayscale-[15%] contrast-110"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 border-2 border-foreground">
                    <div className="font-display text-2xl tracking-wider leading-none">GOOD</div>
                    <div className="font-serif italic text-xs leading-none mt-1">vibes only</div>
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 hidden md:flex w-20 h-20 bg-foreground text-background items-center justify-center rotate-[-12deg] border-2 border-foreground">
                  <div className="text-center">
                    <div className="font-display text-xl leading-none">€20</div>
                    <div className="text-[8px] uppercase tracking-widest mt-1">cut</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling marquee */}
        <div className="border-t-2 border-foreground bg-foreground text-background overflow-hidden">
          <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap py-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center shrink-0">
                <span className="font-display text-xl tracking-[0.3em] mx-8">FRESH CUTS</span>
                <span className="text-primary text-xl">★</span>
                <span className="font-serif italic text-xl mx-8">hot towel shaves</span>
                <span className="text-primary text-xl">★</span>
                <span className="font-display text-xl tracking-[0.3em] mx-8">BARTPFLEGE</span>
                <span className="text-primary text-xl">★</span>
                <span className="font-serif italic text-xl mx-8">straight razor</span>
                <span className="text-primary text-xl">★</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHILL VIBE — full-bleed editorial section featuring the new photo */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 order-2 md:order-1">
            <div className="border-4 border-background relative">
              <img
                src={chillVibe}
                alt="Mainusch Barbershop bei Nacht — chill vibes im Hinterhof"
                className="w-full aspect-[4/5] md:aspect-[4/3] object-cover"
              />
              {/* Overlay tag */}
              <div className="absolute top-4 left-4 bg-background text-foreground px-3 py-1 border-2 border-foreground">
                <div className="text-[9px] uppercase tracking-[0.3em] font-bold">Werkstatt · Nacht</div>
              </div>
              <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 border-2 border-background">
                <div className="font-serif italic text-sm">der echte vibe</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 order-1 md:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 text-primary">
              <span className="h-px w-10 bg-primary" />
              <span className="text-[10px] uppercase tracking-[0.35em] font-bold">Hinterhof Cuts</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight">
              KEIN SALON.<br />
              <span className="font-serif italic text-primary text-4xl md:text-6xl">eine werkstatt.</span>
            </h2>
            <p className="text-background/80 text-base leading-relaxed max-w-md">
              Garagentür auf, Licht an, Spiegel raus — und los. Wir machen das, weil wir es lieben.
              Komm vorbei, hol dir 'nen frischen Schnitt und bleib für 'n Kaffee.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <div>
                <div className="font-display text-3xl text-primary leading-none">200+</div>
                <div className="text-[9px] uppercase tracking-widest text-background/60 mt-1">cuts / monat</div>
              </div>
              <div className="w-px h-10 bg-background/30" />
              <div>
                <div className="font-display text-3xl text-primary leading-none">4.9</div>
                <div className="text-[9px] uppercase tracking-widest text-background/60 mt-1">★ ★ ★ ★ ★</div>
              </div>
              <div className="w-px h-10 bg-background/30" />
              <div>
                <div className="font-display text-3xl text-primary leading-none">1</div>
                <div className="text-[9px] uppercase tracking-widest text-background/60 mt-1">stuhl · ein vibe</div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-3 barber-stripes-thin" />
      </section>

      {/* RECENT WORK */}
      <section className="border-b-2 border-foreground bg-background relative">
        <div className="absolute inset-0 vintage-paper opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <span className="h-px w-10 bg-primary" />
                <span className="text-[10px] uppercase tracking-[0.35em] font-bold">Portfolio</span>
              </div>
              <h2 className="font-display text-5xl md:text-7xl leading-none tracking-tight">
                FRESHE <span className="font-serif italic text-primary">cuts</span>
              </h2>
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-foreground/60 font-bold">
              Schnitte von Can · 2026
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                  <span className="font-bold text-xs uppercase tracking-[0.2em]">{item.label}</span>
                  <RazorIcon className="w-4 h-4 text-primary" />
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <a
              href="https://instagram.com/can.v912"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-background text-foreground px-6 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors text-xs uppercase tracking-[0.25em] font-bold"
            >
              Mehr auf Instagram · @can.v912 →
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES TEASER — old-fashioned price card */}
      <section className="bg-background border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-stretch">
            <div className="space-y-6 self-center">
              <div className="inline-flex items-center gap-2 text-primary">
                <span className="h-px w-10 bg-primary" />
                <span className="text-[10px] uppercase tracking-[0.35em] font-bold">House Specials</span>
              </div>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight">
                EHRLICHE<br />
                <span className="font-serif italic text-primary text-4xl md:text-6xl">preise.</span>
              </h2>
              <p className="text-foreground/70 max-w-md leading-relaxed">
                Keine versteckten Kosten. Keine Aufschläge. Nur Schnitte, die sitzen, und ein guter Talk dabei.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 font-bold text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors border-2 border-foreground"
              >
                Alle Cuts ansehen →
              </Link>
            </div>

            {/* Vintage price card */}
            <div className="border-4 border-foreground bg-background relative">
              <div className="h-3 barber-stripes-thin border-b-2 border-foreground" />
              <div className="p-8 md:p-10">
                <div className="text-center mb-8">
                  <ScissorIcon className="w-10 h-10 text-foreground mx-auto mb-3" />
                  <div className="font-display text-3xl tracking-[0.2em]">PRICE LIST</div>
                  <div className="font-serif italic text-sm text-primary mt-1">Mainusch · seit 2026</div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="h-px w-12 bg-foreground" />
                    <span className="text-foreground">★</span>
                    <span className="h-px w-12 bg-foreground" />
                  </div>
                </div>

                <ul className="space-y-4">
                  {[
                    { name: "Classic Cut", desc: "Schnitt + Wash", price: "20" },
                    { name: "Cut & Beard", desc: "Komplettpaket", price: "30" },
                    { name: "Skin Fade", desc: "Präzision pur", price: "25" },
                    { name: "Hot Towel Shave", desc: "Straight razor", price: "18" },
                    { name: "Kids Cut", desc: "bis 12 Jahre", price: "12" },
                  ].map((item) => (
                    <li key={item.name} className="flex items-baseline gap-3">
                      <span className="font-bold text-foreground">{item.name}</span>
                      <span className="flex-1 border-b border-dotted border-foreground/40 mx-2 mb-1" />
                      <span className="font-display text-xl text-primary">€{item.price}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t-2 border-foreground text-center">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                    Cash & Karte · Trinkgeld geht klar
                  </div>
                </div>
              </div>
              <div className="h-3 barber-stripes-thin border-t-2 border-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground border-b-2 border-foreground relative overflow-hidden">
        <div className="absolute inset-0 vintage-paper opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="font-serif italic text-sm tracking-widest mb-3 opacity-80">walk in or book ahead</div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.9] tracking-tight">
              ZEIT FÜR 'NEN<br />
              <span className="italic font-serif">frischen Cut?</span>
            </h2>
          </div>
          <Link
            href="/buchen"
            className="inline-flex items-center gap-3 bg-foreground text-background px-10 py-5 font-bold text-sm uppercase tracking-[0.25em] hover:bg-background hover:text-foreground transition-colors border-2 border-foreground"
          >
            Jetzt Termin buchen →
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
