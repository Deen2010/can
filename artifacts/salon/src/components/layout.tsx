import { Link, useLocation } from "wouter";
import { ScissorIcon } from "./scissor-icon";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/stylists", label: "Stylist:innen" },
    { href: "/buchen", label: "Termin buchen" },
    { href: "/admin", label: "Verwaltung" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans text-foreground bg-background selection:bg-primary selection:text-white">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-none border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <ScissorIcon className="w-6 h-6 text-border group-hover:text-primary transition-colors" />
            <span className="font-serif text-2xl tracking-tight">
              <strong className="font-bold">Salon</strong>{" "}
              <em className="italic text-muted-foreground">studio</em>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm font-medium uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                >
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-none bg-destructive" />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border mt-24 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <ScissorIcon className="w-5 h-5 text-border" />
            <span className="font-serif text-xl">
              <strong className="font-bold">Salon</strong>
            </span>
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} Salon Studio. Editorial Hair.
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
