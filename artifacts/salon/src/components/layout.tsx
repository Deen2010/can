import { Link, useLocation } from "wouter";
import { ScissorIcon, BarberPoleIcon } from "./scissor-icon";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Start" },
    { href: "/services", label: "Cuts & Preise" },
    { href: "/stylists", label: "Der Barber" },
    { href: "/buchen", label: "Termin buchen" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans text-foreground bg-background selection:bg-primary selection:text-white">
      {/* Top barber stripe banner */}
      <div className="h-2 barber-stripes" />

      <header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <BarberPoleIcon className="w-6 h-16 text-foreground shrink-0" />
            <div className="leading-none">
              <div className="font-display text-3xl tracking-[0.18em] text-foreground">
                MAINUSCH
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-px w-6 bg-primary" />
                <span className="font-serif italic text-xs tracking-widest text-primary">Barber · Est. 2026</span>
                <span className="h-px w-6 bg-primary" />
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-[11px] font-bold uppercase tracking-[0.22em] transition-colors ${
                    isActive ? "text-primary" : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <div className="h-2 barber-stripes" />

      <footer className="bg-foreground text-background py-16 relative overflow-hidden">
        <div className="absolute inset-0 vintage-paper opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 relative">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BarberPoleIcon className="w-5 h-12 text-background" />
              <div>
                <div className="font-display text-2xl tracking-[0.18em]">MAINUSCH</div>
                <div className="font-serif italic text-xs text-primary tracking-widest">Barber Shop</div>
              </div>
            </div>
            <p className="text-xs text-background/70 max-w-xs leading-relaxed mt-4">
              Klassische Cuts, Bartpflege und Hot-Towel-Service. Ein Stuhl, ein Barber, volle Aufmerksamkeit.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Werkstatt</div>
            <div className="font-serif italic text-lg">Mainusch Block</div>
            <div className="text-xs text-background/70">
              Hinterhof · 65xxx Mainz<br />
              Mi – Sa · 12:00 – 21:00<br />
              Termin nach Vereinbarung
            </div>
          </div>

          <div className="space-y-3 md:text-right">
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Folg uns</div>
            <a
              href="https://instagram.com/can.v912"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-serif italic text-lg hover:text-primary transition-colors"
            >
              @can.v912
            </a>
            <div className="text-xs text-background/70">
              © {new Date().getFullYear()} Mainusch · Schnitt von Can
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageTransition({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
