import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LogOut, Palette, Bell, Shield, Fingerprint, Cloud, Info, Wallet } from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";
import { useAuth } from "@/lib/auth";
import { useTheme, type ThemeName } from "@/lib/theme";
import { initials, brl } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  component: ConfigPage,
});

const themes: { key: ThemeName; label: string; swatch: string }[] = [
  { key: "blue", label: "Azul", swatch: "oklch(0.5 0.18 262)" },
  { key: "green", label: "Verde", swatch: "oklch(0.58 0.15 152)" },
  { key: "purple", label: "Roxo", swatch: "oklch(0.55 0.2 300)" },
  { key: "dark", label: "Escuro", swatch: "oklch(0.2 0.025 260)" },
  { key: "amoled", label: "AMOLED", swatch: "oklch(0 0 0)" },
  { key: "light", label: "Claro", swatch: "oklch(0.98 0 0)" },
  { key: "system", label: "Sistema", swatch: "oklch(0.7 0.05 250)" },
];

function ConfigPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const name = (user?.user_metadata?.full_name as string) ?? "João da Silva";

  const handleLogout = async () => {
    await signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/login" });
  };

  return (
    <div className="animate-in-up">
      <AppTopBar title="Configurações" variant="back" />
      <div className="px-4 pt-5 space-y-6">
        {/* Profile */}
        <section className="bg-surface rounded-3xl p-4 border border-border shadow-card flex items-center gap-4">
          <div className="size-14 rounded-full bg-primary-container text-primary-container-foreground grid place-items-center font-bold text-lg">
            {initials(name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold tracking-tight truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Técnico de Manutenção · #12345</p>
          </div>
        </section>

        {/* Themes */}
        <Section title="Aparência" icon={<Palette className="size-4" />}>
          <div className="grid grid-cols-4 gap-2 p-3">
            {themes.map(t => (
              <button
                key={t.key}
                onClick={() => { setTheme(t.key); toast.success(`Tema ${t.label}`); }}
                className={[
                  "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                  theme === t.key ? "bg-primary-container ring-2 ring-ring/40" : "active:bg-muted",
                ].join(" ")}
              >
                <span className="size-8 rounded-full border border-border" style={{ background: t.swatch }} />
                <span className="text-[10.5px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Vale */}
        <Section title="Vale-Refeição" icon={<Wallet className="size-4" />}>
          <Row label="Valor diário" value={brl(45)} />
          <Row label="Saldo mensal (Maio/2025)" value={brl(1200)} />
          <Link to="/vale-refeicao" className="block">
            <NavItem label="Ver painel completo" />
          </Link>
        </Section>

        {/* Notificações */}
        <Section title="Notificações" icon={<Bell className="size-4" />}>
          <Toggle label="OS aberta há mais de 7 dias" defaultOn />
          <Toggle label="Despesas em rascunho há > 3 dias" defaultOn />
          <Toggle label="Saldo VR abaixo de 20%" defaultOn />
          <Toggle label="Adiantamento aprovado há > 5 dias" defaultOn />
          <Toggle label="Lembrete diário de registro" defaultOn />
        </Section>

        {/* Segurança */}
        <Section title="Segurança" icon={<Shield className="size-4" />}>
          <Toggle label="Login com biometria" icon={<Fingerprint className="size-4" />} />
          <Toggle label="Bloqueio por PIN" />
          <NavItem label="Sessões ativas" />
        </Section>

        {/* Sobre */}
        <Section title="Sobre" icon={<Info className="size-4" />}>
          <Row label="Backup automático" value="Hoje, 08:42" icon={<Cloud className="size-4 text-success" />} />
          <NavItem label="Termos e Privacidade" />
          <Row label="Versão" value="1.0.0" />
        </Section>

        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl bg-destructive/10 text-destructive font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <LogOut className="size-4" /> Sair da conta
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-primary">{icon}</span>
        <h2 className="text-[13px] font-semibold tracking-tight text-foreground uppercase">{title}</h2>
      </div>
      <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden divide-y divide-border">
        {children}
      </div>
    </section>
  );
}
function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3.5">
      <span className="text-[13px] text-foreground flex items-center gap-2">{icon}{label}</span>
      <span className="text-[13px] text-muted-foreground font-medium">{value}</span>
    </div>
  );
}
function NavItem({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3.5 text-left active:bg-muted">
      <span className="text-[13px] text-foreground">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}
function Toggle({ label, defaultOn = false, icon }: { label: string; defaultOn?: boolean; icon?: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between p-3.5">
      <span className="text-[13px] text-foreground flex items-center gap-2">{icon}{label}</span>
      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
      <span className="w-10 h-6 rounded-full bg-muted peer-checked:bg-primary relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow-card after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  );
}
