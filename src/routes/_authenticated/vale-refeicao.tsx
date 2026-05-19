import { createFileRoute } from "@tanstack/react-router";
import { AppTopBar } from "@/components/AppTopBar";
import { valeRefeicao } from "@/lib/mock-data";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/vale-refeicao")({
  component: VRPage,
});

function VRPage() {
  const v = valeRefeicao;
  return (
    <div className="animate-in-up">
      <AppTopBar title="Vale-Refeição" variant="back" />
      <div className="px-4 pt-4">
        <p className="text-center font-semibold text-foreground">{v.mes}</p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <SaldoCard label="Saldo inicial" value={brl(v.saldoInicial)} />
          <SaldoCard label="Utilizado" value={brl(v.utilizado)} accent="destructive" />
          <SaldoCard label="Saldo restante" value={brl(v.saldoRestante)} accent="success" />
        </div>

        <section className="bg-surface rounded-3xl p-5 mt-4 border border-border shadow-card">
          <h2 className="font-semibold tracking-tight">Projeção</h2>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">No ritmo atual, o saldo acabará em:</p>
              <p className="text-2xl font-bold text-warning mt-1">{v.projecaoFim}</p>
            </div>
            <div className="relative size-[88px]">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--muted)" strokeWidth="12" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="var(--success)" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${(v.percentUsado / 100) * 251.3} 251.3`}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">{v.percentUsado}%</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Utilizado</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-success to-info rounded-full transition-all" style={{ width: `${v.percentUsado}%` }} />
          </div>
        </section>

        <section className="mt-5">
          <h2 className="font-semibold tracking-tight mb-3">Uso diário</h2>
          <div className="bg-surface rounded-3xl border border-border shadow-card divide-y divide-border overflow-hidden">
            {v.historico.map((h, i) => (
              <div key={i} className="flex justify-between items-center p-3.5">
                <span className="text-[13px] text-foreground">{h.data}</span>
                <span className="text-[13px] font-semibold text-foreground">{brl(h.valor)}</span>
              </div>
            ))}
          </div>
        </section>

        <button className="w-full h-12 mt-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] shadow-fab active:scale-[0.99]">
          Atualizar saldo mensal
        </button>
      </div>
    </div>
  );
}

function SaldoCard({ label, value, accent }: { label: string; value: string; accent?: "destructive" | "success" }) {
  const color = accent === "destructive" ? "text-destructive" : accent === "success" ? "text-success" : "text-foreground";
  return (
    <div className="bg-surface rounded-2xl p-3 text-center border border-border shadow-card">
      <p className="text-[10.5px] text-muted-foreground leading-tight">{label}</p>
      <p className={`text-[14px] font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
