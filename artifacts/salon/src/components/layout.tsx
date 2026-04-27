import { Link, useLocation } from "wouter";
import { ScissorIcon, BarberPoleIcon } from "./scissor-icon";
import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
}

function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
    >
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="13" x2="21" y2="13" />
      <line x1="3" y1="19" x2="21" y2="19" />
    </svg>
  );
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { customer, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const customerInitials = customer?.name
    ? customer.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
    : "";

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    setLocation("/");
  };

  const navLinks = [
    { href: "/", label: "Start" },
    { href: "/services", label: "Cuts & Preise" },
    { href: "/stylists", label: "Der Barber" },
    { href: "/buchen", label: "Termin buchen" },
  ];

  const isLinkActive = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans text-foreground bg-background selection:bg-primary selection:text-white">
      {/* Top barber stripe banner */}
      <div className="h-2 barber-stripes" />

      <header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 md:h-24 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group min-w-0">
            <BarberPoleIcon className="w-5 h-12 md:w-6 md:h-16 text-foreground shrink-0" />
            <div className="leading-none min-w-0">
              <div className="font-display text-xl sm:text-2xl md:text-3xl tracking-[0.18em] text-foreground truncate">
                GOETHE CUTS
              </div>
              <div className="hidden sm:flex items-center gap-2 mt-1">
                <span className="h-px w-6 bg-primary" />
                <span className="font-serif italic text-xs tracking-widest text-primary">Barber · Est. 2026</span>
                <span className="h-px w-6 bg-primary" />
              </div>
              <div className="sm:hidden font-serif italic text-[10px] tracking-widest text-primary mt-1">
                Barber · Est. 2026
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
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
            <span className="h-5 w-px bg-border" />
            {customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  data-testid="button-user-menu"
                  className="group inline-flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="flex items-center justify-center w-9 h-9 bg-foreground text-background font-bold text-[11px] tracking-[0.1em] border-2 border-foreground group-hover:bg-primary group-hover:border-primary transition-colors">
                    {customerInitials || "?"}
                  </span>
                  <span className="hidden lg:flex flex-col items-start leading-tight">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
                      Eingeloggt
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground group-hover:text-primary transition-colors">
                      {customer.name.split(" ")[0]}
                    </span>
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-64 rounded-none border-2 border-foreground bg-background p-0"
                >
                  <DropdownMenuLabel className="px-4 py-3 border-b-2 border-foreground bg-secondary">
                    <div className="text-[9px] uppercase tracking-[0.3em] text-primary font-bold mb-1">
                      Mein Konto
                    </div>
                    <div className="font-serif text-base font-bold leading-tight text-foreground truncate">
                      {customer.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {customer.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    asChild
                    className="rounded-none px-4 py-3 text-[11px] uppercase tracking-[0.22em] font-bold cursor-pointer focus:bg-secondary focus:text-primary"
                  >
                    <Link href="/meine-termine" data-testid="link-my-appointments">
                      Meine Termine
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-none px-4 py-3 text-[11px] uppercase tracking-[0.22em] font-bold cursor-pointer focus:bg-secondary focus:text-primary"
                  >
                    <Link href="/buchen" data-testid="link-new-booking">
                      Neuer Termin
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="m-0 h-[2px] bg-foreground" />
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    data-testid="button-logout"
                    className="rounded-none px-4 py-3 text-[11px] uppercase tracking-[0.22em] font-bold cursor-pointer text-destructive focus:bg-destructive focus:text-white"
                  >
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                data-testid="link-login"
                className={`text-[11px] font-bold uppercase tracking-[0.22em] transition-colors ${
                  location.startsWith("/login") ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile trigger */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            {customer && (
              <Link
                href="/meine-termine"
                data-testid="link-mobile-account"
                aria-label="Mein Konto"
                className="flex items-center justify-center w-10 h-10 bg-foreground text-background font-bold text-[11px] tracking-[0.1em] border-2 border-foreground"
              >
                {customerInitials || "?"}
              </Link>
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                data-testid="button-mobile-menu"
                aria-label="Menü öffnen"
                className="flex items-center justify-center w-10 h-10 border-2 border-foreground bg-background hover:bg-foreground hover:text-background transition-colors"
              >
                <MenuIcon className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[88vw] max-w-sm rounded-none border-l-2 border-foreground bg-background p-0 flex flex-col"
              >
                <SheetHeader className="px-6 py-5 border-b-2 border-foreground bg-background text-left">
                  <SheetTitle className="flex items-center gap-3">
                    <BarberPoleIcon className="w-4 h-10 text-foreground shrink-0" />
                    <div className="leading-none">
                      <div className="font-display text-xl tracking-[0.18em] text-foreground">
                        GOETHE CUTS
                      </div>
                      <div className="font-serif italic text-[10px] tracking-widest text-primary mt-1">
                        Menü
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex-1 overflow-y-auto">
                  <ul className="divide-y-2 divide-foreground/10">
                    {navLinks.map((link) => {
                      const isActive = isLinkActive(link.href);
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            data-testid={`link-mobile-${link.href}`}
                            className={`flex items-center justify-between px-6 py-5 text-sm font-bold uppercase tracking-[0.22em] transition-colors ${
                              isActive
                                ? "text-primary bg-secondary"
                                : "text-foreground hover:bg-secondary"
                            }`}
                          >
                            <span>{link.label}</span>
                            <span className={isActive ? "text-primary" : "text-foreground/40"}>→</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="border-t-2 border-foreground bg-secondary px-6 py-5">
                  {customer ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.3em] text-primary font-bold mb-1">
                          Eingeloggt als
                        </div>
                        <div className="font-serif text-base font-bold leading-tight text-foreground truncate">
                          {customer.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {customer.email}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/meine-termine"
                          data-testid="link-mobile-appointments"
                          className="text-center bg-background border-2 border-foreground px-3 py-3 text-[10px] uppercase tracking-[0.22em] font-bold hover:bg-foreground hover:text-background transition-colors"
                        >
                          Meine Termine
                        </Link>
                        <button
                          onClick={handleLogout}
                          data-testid="button-mobile-logout"
                          className="bg-destructive text-white border-2 border-destructive px-3 py-3 text-[10px] uppercase tracking-[0.22em] font-bold hover:bg-destructive/90 transition-colors"
                        >
                          Abmelden
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      data-testid="link-mobile-login"
                      className="flex items-center justify-center gap-2 bg-foreground text-background px-4 py-4 text-xs uppercase tracking-[0.25em] font-bold hover:bg-primary transition-colors border-2 border-foreground"
                    >
                      Login / Konto anlegen →
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <div className="h-2 barber-stripes" />

      <footer className="bg-foreground text-background py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 vintage-paper opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-12 relative">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BarberPoleIcon className="w-5 h-12 text-background" />
              <div>
                <div className="font-display text-2xl tracking-[0.18em]">GOETHE CUTS</div>
                <div className="font-serif italic text-xs text-primary tracking-widest">Barber Shop</div>
              </div>
            </div>
            <p className="text-xs text-background/70 max-w-xs leading-relaxed mt-4">
              Klassische Cuts, Bartpflege und Hot-Towel-Service. Ein Stuhl, ein Barber, volle Aufmerksamkeit.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Werkstatt</div>
            <div className="font-serif italic text-lg">Goethe Block</div>
            <div className="text-xs text-background/70">
              Hinterhof · 65xxx Mainz<br />
              Mi – Sa · 12:00 – 21:00<br />
              Termin nach Vereinbarung
            </div>
          </div>

          <div className="space-y-3 sm:col-span-2 md:col-span-1 md:text-right">
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
              © {new Date().getFullYear()} Goethe Cuts · Schnitt von Can
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
