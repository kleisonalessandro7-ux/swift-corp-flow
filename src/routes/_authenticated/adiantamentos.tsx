import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { AppStatusChip } from "@/components/AppStatusChip";
import { AdiantamentoForm } from "@/components/forms/AdiantamentoForm";
import { useAdiantamentos, useDeleteAdiantamento, type AdiantamentoRow } from "@/lib/db";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/adiantamentos")({ component: AdiantamentosPage });

const statusLabel: Record<AdiantamentoRow["status"], string> = { pendente: "Pendente", aprovado: "Aprovado", recebido: "Recebido", cancelado: "Cancelado" };
const statusTone = (s: AdiantamentoRow["status"]) => s === "recebido" ? "success" : s === "aprovado" ? "info" : s === "pendente" ? "warning" : "destructive";

function AdiantamentosPage() {
  const { data: list = [], isLoading } = useAdiantamentos();
  const del = useDeleteAdiantamento();
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdiantamentoRow | null>(null);

  const filtered = useMemo(() => list.filter(a =>
    q === "" || (a.cliente ?? "").toLowerCase().includes(q.toLowerCase()) || (a.ordens_servico?.numero ?? "").toLowerCase().includes(q.toLowerCase())
  ), [list, q]);

  return (
    <div className="animate-in-up">
      <AppTopBar title="Adiantamentos" right={
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="size-10 grid place-items-center rounded-full bg-white/10 active:bg-white/20 ripple">
          <Plus className="size-5" />
        </button>
      } />
      <div className="px-4 pt-4">
        <label className="flex items-center gap-2 h-11 px-3.5 rounded-full bg-muted">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por OS ou cliente"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
        </label>

        {isLoading && <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Nenhum adiantamento.</p>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="mt-3 inline-flex items-center gap-2 px-4 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              <Plus className="size-4" /> Solicitar adiantamento
            </button>
          </div>
        )}

        <div className="space-y-3 mt-4">
          {filtered.map((a, i) => {
            const saldo = Number(a.solicitado) - Number(a.recebido);
            return (
              <article key={a.id} style={{ animationDelay: `${i * 40}ms` }}
                className="bg-surface rounded-3xl p-4 border border-border shadow-card animate-in-up">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[15px] tracking-tight">{a.ordens_servico?.numero ?? "Sem OS"}</h3>
                  <AppStatusChip tone={statusTone(a.status)}>{statusLabel[a.status]}</AppStatusChip>
                </div>
                {a.cliente && <p className="text-[13px] text-foreground mt-1">{a.cliente}</p>}
                {a.periodo && <p className="text-xs text-muted-foreground">Período: {a.periodo}</p>}
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  <Row label="Solicitado:" value={brl(Number(a.solicitado))} />
                  <Row label="Recebido:" value={brl(Number(a.recebido))} valueClass={Number(a.recebido) === 0 ? "text-foreground" : "text-success"} />
                  <Row label="Saldo:" value={brl(saldo)} valueClass={`font-bold ${saldo > 0 ? "text-destructive" : "text-success"}`} />
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button onClick={() => { setEditing(a); setFormOpen(true); }}
                    className="flex-1 h-9 rounded-xl bg-muted text-[12px] font-medium flex items-center justify-center gap-1.5">
                    <Pencil className="size-3.5" /> Editar
                  </button>
                  <button onClick={() => { if (confirm("Excluir?")) del.mutate(a.id); }}
                    className="size-9 grid place-items-center rounded-xl bg-destructive/10 text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <AdiantamentoForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />
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
