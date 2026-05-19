import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";
import { AppStatusChip } from "@/components/AppStatusChip";
import { adiantamentos } from "@/lib/mock-data";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/adiantamentos")({
  component: AdiantamentosPage,
});

function AdiantamentosPage() {
  return (
    <div className="animate-in-up">
      <AppTopBar title="Adiantamentos" right={
        <button className="size-10 grid place-items-center rounded-full bg-white/10 active:bg-white/20 ripple">
          <Plus className="size-5" />
        </button>
      } />
      <div className="px-4 pt-4">
        <label className="flex items-center gap-2 h-11 px-3.5 rounded-full bg-muted">
          <Search className="size-4 text-muted-foreground" />
          <input placeholder="Buscar por OS ou cliente" className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
        </label>

        <div className="space-y-3 mt-4">
          {adiantamentos.map((a, i) => {
            const tone = a.status === "Recebido" ? "success" : "warning";
            const saldoTone = a.recebido === 0 ? "text-destructive" : "text-success";
            return (
              <article
                key={a.id}
                style={{ animationDelay: `${i * 40}ms` }}
                className="bg-surface rounded-3xl p-4 border border-border shadow-card animate-in-up"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[15px] tracking-tight">{a.os}</h3>
                  <AppStatusChip tone={tone}>{a.status === "Recebido" ? "Recebido" : "Aprovado"}</AppStatusChip>
                </div>
                <p className="text-[13px] text-foreground mt-1">{a.cliente}</p>
                <p className="text-xs text-muted-foreground">Período: {a.periodo}</p>

                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  <Row label="Solicitado:" value={brl(a.solicitado)} />
                  <Row label="Recebido:" value={brl(a.recebido)} valueClass={a.recebido === 0 ? "text-foreground" : "text-success"} />
                  <Row label="Saldo:" value={brl(a.saldo)} valueClass={`font-bold ${saldoTone}`} />
                </div>

                {a.recebido === 0 && (
                  <div className="mt-3 flex justify-end">
                    <AppStatusChip tone="warning">Pendente recebimento</AppStatusChip>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-3">Solicitação: {new Date(a.data).toLocaleDateString("pt-BR")}</p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass ?? "text-foreground font-semibold"}>{value}</span>
    </div>
  );
}
