import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, LogOut, Palette, Bell, Shield, Wallet, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AppTopBar } from "@/components/AppTopBar";
import { useAuth } from "@/lib/auth";
import { useTheme, type ThemeName } from "@/lib/theme";
import { initials, brl } from "@/lib/format";
import { useProfile, useUpdateProfile, useVRConfig, useUpdateVRConfig } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/configuracoes")({ component: ConfigPage });

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
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: vr } = useVRConfig();
  const updateVR = useUpdateVRConfig();
  const navigate = useNavigate();
  const name = profile?.full_name ?? "Usuário";

  const [notif, setNotif] = useState({ os7: true, despesa3: true, vr20: true, ad5: true, daily: true });

  const handleLogout = async () => {
    await signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/login" });
  };

  const editName = () => {
    const novo = prompt("Nome completo:", name);
    if (novo && novo.trim()) updateProfile.mutate({ full_name: novo.trim() });
  };

  const editVR = (campo: "valor_diario" | "saldo_mensal", labelTxt: string) => {
    const atual = campo === "valor_diario" ? vr?.valor_diario : vr?.saldo_mensal;
    const novo = prompt(`${labelTxt} (R$):`, String(atual ?? ""));
    if (novo) {
      const v = parseFloat(novo.replace(",", "."));
      if (!isNaN(v)) updateVR.mutate({ [campo]: v });
    }
  };

  return (
    <div className="animate-in-up">
      <AppTopBar title="Configurações" variant="back" />
      <div className="px-4 pt-5 space-y-6">
        <section className="bg-surface rounded-3xl p-4 border border-border shadow-card flex items-center gap-4">
          <div className="size-14 rounded-full bg-primary-container text-primary-container-foreground grid place-items-center font-bold text-lg">
            {initials(name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold tracking-tight truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            {profile?.cargo && <p className="text-[11px] text-muted-foreground mt-0.5">{profile.cargo}{profile.matricula ? ` · #${profile.matricula}` : ""}</p>}
          </div>
          <button onClick={editName} className="size-9 grid place-items-center rounded-full bg-muted active:scale-95">
            <Pencil className="size-4" />
          </button>
        </section>

        <Section title="Aparência" icon={<Palette className="size-4" />}>
          <div className="grid grid-cols-4 gap-2 p-3">
            {themes.map(t => (
              <button key={t.key} onClick={() => { setTheme(t.key); toast.success(`Tema ${t.label}`); }}
                className={["flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                  theme === t.key ? "bg-primary-container ring-2 ring-ring/40" : "active:bg-muted"].join(" ")}>
                <span className="size-8 rounded-full border border-border" style={{ background: t.swatch }} />
                <span className="text-[10.5px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Vale-Refeição" icon={<Wallet className="size-4" />}>
          <RowBtn label="Valor diário" value={brl(Number(vr?.valor_diario ?? 45))} onClick={() => editVR("valor_diario", "Valor diário")} />
          <RowBtn label="Saldo mensal" value={brl(Number(vr?.saldo_mensal ?? 1200))} onClick={() => editVR("saldo_mensal", "Saldo mensal")} />
          <Link to="/vale-refeicao"><NavItem label="Ver painel completo" /></Link>
        </Section>

        <Section title="Relatórios" icon={<FileText className="size-4" />}>
          <Link to="/relatorios"><NavItem label="Gerar relatório PDF" /></Link>
        </Section>

        <Section title="Notificações" icon={<Bell className="size-4" />}>
          <Toggle label="OS aberta há mais de 7 dias" checked={notif.os7} onChange={v => setNotif(s => ({ ...s, os7: v }))} />
          <Toggle label="Despesas em rascunho > 3 dias" checked={notif.despesa3} onChange={v => setNotif(s => ({ ...s, despesa3: v }))} />
          <Toggle label="Saldo VR abaixo de 20%" checked={notif.vr20} onChange={v => setNotif(s => ({ ...s, vr20: v }))} />
          <Toggle label="Adiantamento aprovado > 5 dias" checked={notif.ad5} onChange={v => setNotif(s => ({ ...s, ad5: v }))} />
          <Toggle label="Lembrete diário de registro" checked={notif.daily} onChange={v => setNotif(s => ({ ...s, daily: v }))} />
        </Section>

        <Section title="Segurança" icon={<Shield className="size-4" />}>
          <RowBtn label="Alterar senha" onClick={() => toast.info("Recurso em breve")} />
          <RowBtn label="Sessões ativas" onClick={() => toast.info("1 sessão ativa (este dispositivo)")} />
        </Section>

        <button onClick={handleLogout}
          className="w-full h-12 rounded-2xl bg-destructive/10 text-destructive font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.99]">
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
        <h2 className="text-[13px] font-semibold tracking-tight uppercase">{title}</h2>
      </div>
      <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden divide-y divide-border">{children}</div>
    </section>
  );
}
function RowBtn({ label, value, onClick }: { label: string; value?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3.5 text-left active:bg-muted">
      <span className="text-[13px] text-foreground">{label}</span>
      <span className="flex items-center gap-2">
        {value && <span className="text-[13px] text-muted-foreground font-medium">{value}</span>}
        <ChevronRight className="size-4 text-muted-foreground" />
      </span>
    </button>
  );
}
function NavItem({ label }: { label: string }) {
  return (
    <div className="w-full flex items-center justify-between p-3.5 active:bg-muted">
      <span className="text-[13px] text-foreground">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between p-3.5 cursor-pointer">
      <span className="text-[13px] text-foreground">{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="peer sr-only" />
      <span className="w-10 h-6 rounded-full bg-muted peer-checked:bg-primary relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow-card after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  );
}
