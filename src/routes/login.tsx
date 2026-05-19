import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && session) navigate({ to: "/dashboard" });
  }, [session, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
      } else {
        const redirectUrl = `${window.location.origin}/dashboard`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro com Google");
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex flex-col">
      {/* Decorative top */}
      <div className="relative px-6 pt-16 pb-10 bg-gradient-to-br from-topbar via-primary to-primary text-primary-foreground overflow-hidden">
        <div className="absolute -top-20 -right-16 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 size-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative animate-in-up">
          <div className="size-14 grid place-items-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
            <Sparkles className="size-7" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">ViagemCorp</h1>
          <p className="mt-1.5 text-sm text-primary-foreground/80">
            Gestão profissional de despesas e viagens corporativas.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8 pb-32 animate-in-up">
        <div className="flex bg-muted rounded-full p-1 mb-6">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={[
                "flex-1 py-2.5 rounded-full text-sm font-semibold transition-all",
                mode === m ? "bg-surface text-foreground shadow-card" : "text-muted-foreground",
              ].join(" ")}
            >
              {m === "signin" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <Field icon={<Sparkles className="size-4" />} placeholder="Nome completo" value={name} onChange={setName} type="text" />
          )}
          <Field icon={<Mail className="size-4" />} placeholder="E-mail corporativo" value={email} onChange={setEmail} type="email" required />
          <div className="relative">
            <Field
              icon={<Lock className="size-4" />}
              placeholder="Senha"
              value={password}
              onChange={setPassword}
              type={showPass ? "text" : "password"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-2"
              aria-label="Mostrar senha"
            >
              {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] shadow-fab active:scale-[0.99] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou continue com</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full h-12 rounded-2xl border border-border bg-surface text-foreground font-medium text-sm shadow-card active:scale-[0.99] transition-transform flex items-center justify-center gap-3"
        >
          <GoogleIcon />
          Continuar com Google
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos Termos e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}

function Field({
  icon, placeholder, value, onChange, type, required,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 h-12 px-4 rounded-2xl bg-input border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30 transition-all">
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29 35.2 26.6 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.3C40.9 35.9 44 30.4 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
