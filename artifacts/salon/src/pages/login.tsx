import { useState, type FormEvent } from "react";
import { useLocation, Link, useSearch } from "wouter";
import { PageTransition } from "@/components/layout";
import { ScissorIcon } from "@/components/scissor-icon";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const next = new URLSearchParams(search).get("next") || "/meine-termine";

  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (name.trim().length < 1) throw new Error("Name fehlt");
        if (phone.trim().length < 3) throw new Error("Telefon fehlt");
        if (password.length < 6) throw new Error("Passwort min. 6 Zeichen");
        await register({ email, password, name, phone });
      }
      setLocation(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Etwas ist schiefgelaufen";
      const friendly = msg.includes("401")
        ? "E-Mail oder Passwort falsch"
        : msg.includes("409")
          ? "Diese E-Mail ist bereits registriert"
          : msg;
      setError(friendly);
    } finally {
      setPending(false);
    }
  };

  return (
    <PageTransition className="flex-1 max-w-md mx-auto w-full px-6 py-24">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <ScissorIcon className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-display text-4xl tracking-[0.18em] mb-2">
          {mode === "login" ? "EINLOGGEN" : "REGISTRIEREN"}
        </h1>
        <p className="font-serif italic text-sm text-muted-foreground">
          {mode === "login"
            ? "Schön, dass du wieder da bist."
            : "Konto anlegen für schnelles Buchen."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 border border-border bg-secondary p-8">
        {mode === "register" && (
          <>
            <div>
              <label className="text-xs uppercase tracking-widest block mb-2">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-background border-b border-border focus:border-primary outline-none px-4 py-3 transition-colors"
                placeholder="Vor- und Nachname"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest block mb-2">Telefon</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                type="tel"
                className="w-full bg-background border-b border-border focus:border-primary outline-none px-4 py-3 transition-colors"
                placeholder="+49 ..."
                autoComplete="tel"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-xs uppercase tracking-widest block mb-2">E-Mail</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            className="w-full bg-background border-b border-border focus:border-primary outline-none px-4 py-3 transition-colors"
            placeholder="email@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest block mb-2">Passwort</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            minLength={mode === "register" ? 6 : 1}
            className="w-full bg-background border-b border-border focus:border-primary outline-none px-4 py-3 transition-colors"
            placeholder={mode === "register" ? "Min. 6 Zeichen" : "Passwort"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {error && (
          <div className="text-xs text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-destructive text-white uppercase tracking-widest text-sm font-medium py-4 hover:bg-destructive/90 transition-colors disabled:opacity-50"
        >
          {pending
            ? "Bitte warten..."
            : mode === "login"
              ? "Einloggen"
              : "Konto anlegen"}
        </button>

        <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
          {mode === "login" ? (
            <>
              Noch kein Konto?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("register");
                }}
                className="uppercase tracking-widest text-primary hover:underline"
              >
                Registrieren
              </button>
            </>
          ) : (
            <>
              Schon ein Konto?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("login");
                }}
                className="uppercase tracking-widest text-primary hover:underline"
              >
                Einloggen
              </button>
            </>
          )}
        </div>
      </form>

      <div className="text-center mt-8">
        <Link
          href="/buchen"
          className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary"
        >
          Auch ohne Konto buchen →
        </Link>
      </div>
    </PageTransition>
  );
}
