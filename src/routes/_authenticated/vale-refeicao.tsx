import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { VRUsoForm } from "@/components/forms/VRUsoForm";
import { useVRConfig, useVRUso, useDeleteVRUso, useUpdateVRConfig } from "@/lib/db";
import { brl, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/vale-refeicao")({ component: VRPage });

function VRPage() {
  const { data: cfg } = useVRConfig();
  const { data: usos = [] } = useVRUso();
  const del = useDeleteVRUso();
  const updateCfg = useUpdateVRConfig();
  const [open, setOpen] = useState(false);

  const saldoInicial = Number(cfg?.saldo_mensal ?? 1200);
  const valorDiario = Number(cfg?.valor_diario ?? 45);
  const utilizado = usos.reduce((a, b) => a + Number(b.valor), 0);
  const restante = Math.max(0, saldoInicial - utilizado);
  const percent = saldoInicial > 0 ? Math.round((utilizado / saldoInicial) * 100) : 0;

  const mesNome = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // Projeção de fim de saldo
  const diasUsados = new Set(usos.map(u => u.data)).size || 1;
  const mediaDiaria = utilizado / diasUsados;
  const diasRestantes = mediaDiaria > 0 ? Math.floor(restante / mediaDiaria) : 30;
  const dataFim = new Date();
  dataFim.setDate(dataFim.getDate() + diasRestantes);

  const atualizarSaldo = () => {
    const novo = prompt("Novo saldo mensal (R$):", String(saldoInicial));
    if (novo) {
      const v = parseFloat(novo.replace(",", "."));
      if (!isNaN(v)) updateCfg.mutate({ saldo_mensal: v });
    }
  };

  return (
    <div className="animate-in-up">
      <AppTopBar title="Vale-Refeição" variant="back" right={
        <button onClick={() => setOpen(true)} className="size-10 grid place-items-center rounded-full bg-white/10 active:bg-white/20 ripple">
          <Plus className="size-5" />
        </button>
      } />
      <div className="px-4 pt-4">
        <p className="text-center font-semibold capitalize">{mesNome}</p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <SaldoCard label="Saldo inicial" value={brl(saldoInicial)} />
          <SaldoCard label="Utilizado" value={brl(utilizado)} accent="destructive" />
          <SaldoCard label="Restante" value={brl(restante)} accent="success" />
        </div>

        <section className="bg-surface rounded-3xl p-5 mt-4 border border-border shadow-card">
          <h2 className="font-semibold tracking-tight">Projeção</h2>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Valor diário configurado:</p>
              <p className="text-2xl font-bold text-primary mt-1">{brl(valorDiario)}</p>
              <p className="text-[11px] text-muted-foreground mt-2">No ritmo atual, saldo até:</p>
              <p className="text-sm font-semibold text-warning">{dataFim.toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="relative size-[88px]">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--muted)" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--success)" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${(percent / 100) * 251.3} 251.3`} />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-sm font-bold leading-none">{percent}%</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Utilizado</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-success to-info rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
        </section>

        <section className="mt-5">
          <h2 className="font-semibold tracking-tight mb-3">Uso diário</h2>
          {usos.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8 bg-surface rounded-3xl border border-border">
              Nenhum uso registrado este mês.
            </p>
          ) : (
            <div className="bg-surface rounded-3xl border border-border shadow-card divide-y divide-border overflow-hidden">
              {usos.map(u => (
                <div key={u.id} className="flex justify-between items-center p-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground">{fmtDate(u.data)}</p>
                    {u.descricao && <p className="text-[11px] text-muted-foreground truncate">{u.descricao}</p>}
                  </div>
                  <span className="text-[13px] font-semibold text-foreground mr-2">{brl(Number(u.valor))}</span>
                  <button onClick={() => { if (confirm("Excluir?")) del.mutate(u.id); }}
                    className="size-8 grid place-items-center rounded-full text-muted-foreground active:bg-destructive/10 active:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <button onClick={atualizarSaldo}
          className="w-full h-12 mt-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] shadow-fab active:scale-[0.99]">
          Atualizar saldo mensal
        </button>
      </div>
      <VRUsoForm open={open} onClose={() => setOpen(false)} />
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
