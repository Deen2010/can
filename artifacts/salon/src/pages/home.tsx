import { PageTransition } from "@/components/layout";
import { Link } from "wouter";
import { ScissorIcon } from "@/components/scissor-icon";
import interiorImg from "@/assets/salon-interior-1.png";
import detailImg from "@/assets/salon-detail-1.png";
import workCurly from "@assets/WhatsApp_Image_2026-04-27_at_4.10.09_PM_1777299203934.jpeg";
import workBeard from "@assets/WhatsApp_Image_2026-04-27_at_4.10.08_PM_1777299203936.jpeg";
import workFade from "@assets/WhatsApp_Image_2026-04-27_at_4.10.09_PM_(1)_1777299203937.jpeg";
import goodVibes from "@assets/WhatsApp_Image_2026-04-27_at_4.15.21_PM_1777299354495.jpeg";

export default function Home() {
  return (
    <PageTransition className="flex-1 flex flex-col">
      <section className="relative min-h-[80vh] flex flex-col justify-center px-6 py-24 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-xl">
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] text-foreground">
              <strong className="font-bold block mb-2">Schnitt</strong>
              <em className="italic text-primary block">nach Termin</em>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-md">
              Ein Stuhl, ein Friseur, volle Aufmerksamkeit. Präzise Schnitte, ehrliche Preise, gute Vibes.
            </p>
            <div className="pt-4">
              <Link 
                href="/buchen"
                className="inline-flex items-center justify-center bg-primary text-white uppercase tracking-widest text-sm font-medium px-8 py-4 hover:bg-primary/90 transition-colors"
              >
                Termin buchen
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] md:aspect-square w-full max-w-md ml-auto">
            <img 
              src={goodVibes} 
              alt="Can mit Kunde im Salon" 
              className="w-full h-full object-cover border border-border"
            />
            <div className="absolute -bottom-6 -left-6 px-4 py-3 bg-background border border-border">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Im Salon</div>
              <div className="font-serif italic text-primary text-lg leading-tight">good vibes only</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-12 gap-8">
            <h2 className="font-serif text-3xl md:text-5xl">
              <strong className="font-bold">Aktuelle</strong> <em className="italic text-primary">Arbeiten</em>
            </h2>
            <div className="text-xs uppercase tracking-widest text-muted-foreground hidden md:block">
              Schnitte von Can
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <figure className="space-y-3">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={workCurly} alt="Curly Cut von Can" className="w-full h-full object-cover" />
              </div>
              <figcaption className="flex items-baseline justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Locken · Tapered</span>
                <span>01</span>
              </figcaption>
            </figure>
            <figure className="space-y-3">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={workBeard} alt="Haarschnitt mit Bart von Can" className="w-full h-full object-cover" />
              </div>
              <figcaption className="flex items-baseline justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Schnitt · Bart</span>
                <span>02</span>
              </figcaption>
            </figure>
            <figure className="space-y-3">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={workFade} alt="Skin Fade von Can" className="w-full h-full object-cover" />
              </div>
              <figcaption className="flex items-baseline justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Skin Fade</span>
                <span>03</span>
              </figcaption>
            </figure>
          </div>
          <div className="mt-10 flex justify-end">
            <a
              href="https://instagram.com/can.v912"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block uppercase tracking-widest text-xs font-medium border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors"
            >
              Mehr auf Instagram · @can.v912
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">
                <strong className="font-bold">Unser</strong> <em className="italic">Anspruch</em>
              </h2>
              <p className="text-muted-foreground">
                Kein Stress, keine Hektik. Nur saubere Schnitte und Zeit für jeden Kunden.
              </p>
              <Link href="/services" className="inline-block uppercase tracking-widest text-xs font-medium border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors">
                Leistungen ansehen
              </Link>
            </div>
            <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
               <img src={detailImg} alt="Detail" className="w-full aspect-[4/3] object-cover border border-border" />
               <div className="bg-background border border-border p-8 flex flex-col justify-between aspect-[4/3]">
                 <ScissorIcon className="w-8 h-8 text-primary" />
                 <div>
                   <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Dein Friseur</div>
                   <h3 className="font-serif text-2xl font-bold">Can</h3>
                   <div className="mt-6">
                     <Link href="/stylists" className="inline-block uppercase tracking-widest text-xs font-medium text-primary hover:text-foreground transition-colors">
                       Mehr erfahren
                     </Link>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
