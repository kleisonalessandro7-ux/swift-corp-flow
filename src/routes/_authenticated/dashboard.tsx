import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, TrendingUp, Plus, Clock as ClockIcon, ClipboardList, DollarSign, ArrowRight, Utensils, Fuel, MapPin, BedDouble, ChevronRight, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { brl, greeting, initials, fmtDate } from "@/lib/format";
import { AppStatusChip } from "@/components/AppStatusChip";
import { useDashboard, useDespesas, useProfile } from "@/lib/db";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type Cat = Database["public"]["Enums"]["despesa_categoria"];
const catIcons: Record<Cat, typeof Utensils> = {
  almoco: Utensils, jantar: Utensils, combustivel: Fuel, pedagio: MapPin, hospedagem: BedDouble, outras: MoreHorizontal,
};

function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: stats } = useDashboard();
  const { data: despesas = [] } = useDespesas();
  const name = profile?.full_name ?? (user?.user_metadata?.full_name as string) ?? user?.email?.split("@")[0] ?? "Usuário";

  return (
    <div className="animate-in-up">
      <header className="bg-topbar text-topbar-foreground px-5 pt-12 pb-8 rounded-b-3xl safe-pt">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-white/15 border border-white/20 grid place-items-center font-semibold backdrop-blur">
              {initials(name)}
            </div>
            <div>
              <p className="text-xs text-topbar-foreground/70">{greeting(name)}</p>
              <p className="font-semibold tracking-tight">{name.split(" ")[0]}</p>
            </div>
          </div>
          <Link to="/configuracoes" className="relative size-10 grid place-items-center rounded-full bg-white/10 active:bg-white/20 ripple">
            <Bell className="size-5" />
          </Link>
        </div>
        <div className="mt-6">
          <p className="text-xs text-topbar-foreground/70">Total gasto no mês</p>
          <p className="text-3xl font-bold tracking-tight mt-1">{brl(stats?.totalMes ?? 0)}</p>
          <p className="text-xs mt-1 text-topbar-foreground/70 flex items-center gap-1">
            <TrendingUp className="size-3.5 text-success" /> Mês atual
          </p>
        </div>
      </header>

      <div className="px-5 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <MiniCard label="Horas trabalhadas" value={stats?.horasMes ?? "—"} />
          <MiniCard label="Saldo a receber" value={brl(stats?.saldoReceber ?? 0)} sub="A receber" tone="primary" />
          <MiniCard label="Adiantamentos" value={brl(stats?.adiantamentosPendentes ?? 0)} sub={`${stats?.adiantamentosCount ?? 0} pendentes`} />
          <MiniCard label="Vale-refeição" value={brl(stats?.valeRestante ?? 0)} sub={`${stats?.valePercent ?? 0}% utilizado`} tone="success" />
        </div>

        {(stats?.categorias.length ?? 0) > 0 && (
          <section className="mt-5 bg-surface rounded-3xl p-5 shadow-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold tracking-tight">Gastos por categoria</h2>
              <span className="text-xs text-muted-foreground">Mês atual</span>
            </div>
            <div className="flex items-center gap-5">
              <Donut data={stats!.categorias} total={brl(stats!.totalMes)} />
              <div className="flex-1 space-y-2">
                {stats!.categorias.slice(0, 5).map(c => (
                  <div key={c.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                      <span className="text-foreground">{c.label}</span>
                    </div>
                    <span className="font-semibold text-muted-foreground">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mt-5">
          <h2 className="font-semibold tracking-tight mb-3">Acesso rápido</h2>
          <div className="grid grid-cols-4 gap-2">
            <QuickAction to="/despesas" Icon={Plus} label="Despesa" />
            <QuickAction to="/horas" Icon={ClockIcon} label="Horas" />
            <QuickAction to="/os" Icon={ClipboardList} label="Nova OS" />
            <QuickAction to="/adiantamentos" Icon={DollarSign} label="Adiant." />
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold tracking-tight">Últimas movimentações</h2>
            <Link to="/despesas" className="text-xs text-primary font-semibold flex items-center gap-0.5">
              Ver todas <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="bg-surface rounded-3xl border border-border shadow-card divide-y divide-border overflow-hidden">
            {despesas.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Sem movimentações ainda.</p>
            )}
            {despesas.slice(0, 5).map(d => {
              const Icon = catIcons[d.categoria] ?? ChevronRight;
              const tone = d.status === "aprovado" ? "success" : d.status === "rascunho" ? "warning" : d.status === "rejeitado" ? "destructive" : "info";
              return (
                <div key={d.id} className="flex items-center gap-3 p-3.5">
                  <span className="size-10 grid place-items-center rounded-full bg-primary-container text-primary-container-foreground shrink-0">
                    <Icon className="size-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{d.descricao}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{fmtDate(d.data)} • {d.ordens_servico?.numero ?? "Sem OS"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-semibold">{brl(Number(d.valor))}</p>
                    <AppStatusChip tone={tone} size="xs">{d.status}</AppStatusChip>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniCard({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "primary" | "success" }) {
  const accent = tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="bg-surface rounded-2xl p-3.5 shadow-card border border-border">
      <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
      <p className={`text-[17px] font-bold tracking-tight mt-1 ${accent}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function QuickAction({ to, Icon, label }: { to: string; Icon: typeof Utensils; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
      <span className="size-12 grid place-items-center rounded-2xl bg-primary-container text-primary-container-foreground shadow-card">
        <Icon className="size-5" />
      </span>
      <span className="text-[10.5px] text-center text-foreground leading-tight font-medium">{label}</span>
    </Link>
  );
}

function Donut({ data, total }: { data: { label: string; value: number; color: string }[]; total: string }) {
  const R = 36, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="relative size-[120px] shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--muted)" strokeWidth="14" />
        {data.map((d, i) => {
          const len = (d.value / 100) * C;
          const seg = <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={d.color} strokeWidth="14"
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return seg;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-[15px] font-bold leading-none">{total}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Total</p>
        </div>
      </div>
    </div>
  );
}
