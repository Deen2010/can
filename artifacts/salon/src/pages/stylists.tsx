import { PageTransition } from "@/components/layout";
import { useListStylists } from "@workspace/api-client-react";
import { Link } from "wouter";

// Fallback images since API might return placeholder URLs that don't load or exist
import img1 from "@/assets/stylist-1.png";
import img2 from "@/assets/stylist-2.png";
import img3 from "@/assets/stylist-3.png";

const fallbackImages = [img1, img2, img3];

export default function Stylists() {
  const { data: stylists, isLoading } = useListStylists();

  return (
    <PageTransition className="flex-1 max-w-7xl mx-auto w-full px-6 py-24">
      <header className="mb-16">
        <h1 className="font-serif text-5xl md:text-6xl mb-6">
          <strong className="font-bold">Dein</strong> <em className="italic">Friseur</em>
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg">
          Ein Stuhl, ein Friseur, volle Aufmerksamkeit. Spezialisiert auf saubere Schnitte und Bartpflege.
        </p>
      </header>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse border border-border">
              <div className="aspect-square bg-border" />
              <div className="p-6 space-y-4">
                <div className="h-6 w-1/2 bg-border" />
                <div className="h-4 w-1/3 bg-border" />
                <div className="h-16 w-full bg-border" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {stylists?.map((stylist, index) => (
            <Link
              key={stylist.id}
              href={`/buchen?stylist=${stylist.id}`}
              className="group block border border-border bg-background hover:border-primary transition-colors"
            >
              <div className="aspect-square border-b border-border overflow-hidden bg-secondary relative">
                <img
                  src={fallbackImages[index % fallbackImages.length]}
                  alt={stylist.name}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-serif text-3xl font-bold group-hover:text-primary transition-colors">
                      {stylist.name}
                    </h2>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                      {stylist.role}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                  {stylist.bio}
                </p>
                <div className="space-y-3">
                  <div className="text-[10px] uppercase tracking-widest text-primary">Spezialgebiete</div>
                  <div className="flex flex-wrap gap-2">
                    {stylist.specialties.map(spec => (
                      <span key={spec} className="text-xs border border-border px-2 py-1 bg-secondary text-foreground">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3">
                    <a
                      href="https://instagram.com/can.v912"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-block text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                    >
                      Instagram · @can.v912
                    </a>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-medium">
                    Termin buchen
                  </span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
