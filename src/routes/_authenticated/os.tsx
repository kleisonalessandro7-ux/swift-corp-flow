import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { AppStatusChip } from "@/components/AppStatusChip";
import { OSForm } from "@/components/forms/OSForm";
import { useOSList, useDeleteOS, type OSRow } from "@/lib/db";
import { brl, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/os")({ component: OSPage });

type Status = OSRow["status"];
const filters: { key: "todas" | Status; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "aberta", label: "Aberta" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "encerrada", label: "Encerrada" },
  { key: "cancelada", label: "Cancelada" },
];
const tone = (s: Status) => s === "em_andamento" ? "success" : s === "aberta" ? "warning" : s === "encerrada" ? "info" : "destructive";
const label = (s: Status) => s === "em_andamento" ? "Em andamento" : s === "aberta" ? "Aberta" : s === "encerrada" ? "Encerrada" : "Cancelada";

function OSPage() {
  const { data: list = [], isLoading } = useOSList();
  const del = useDeleteOS();
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("todas");
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OSRow | null>(null);

  const filtered = useMemo(
    () => list.filter(o => (filter === "todas" || o.status === filter) && (q === "" || `${o.numero} ${o.cliente}`.toLowerCase().includes(q.toLowerCase()))),
    [list, filter, q]
  );

  return (
    <div className="animate-in-up">
      <AppTopBar title="Ordens de Serviço" right={
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="size-10 grid place-items-center rounded-full bg-white/10 active:bg-white/20 ripple">
          <Plus className="size-5" />
        </button>
      } />
      <div className="px-4 pt-4">
        <label className="flex items-center gap-2 h-11 px-3.5 rounded-full bg-muted">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nº da OS ou cliente"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
        </label>
        <div className="flex gap-2 mt-3 -mx-4 px-4 overflow-x-auto hide-scrollbar">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={["px-4 h-9 rounded-full text-[13px] font-medium whitespace-nowrap transition-all",
                filter === f.key ? "bg-primary text-primary-foreground shadow-card" : "bg-muted text-muted-foreground"].join(" ")}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="space-y-3 mt-4">
          {isLoading && <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Nenhuma OS encontrada.</p>
              <button onClick={() => { setEditing(null); setFormOpen(true); }} className="mt-3 inline-flex items-center gap-2 px-4 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                <Plus className="size-4" /> Criar primeira OS
              </button>
            </div>
          )}
          {filtered.map((o, i) => (
            <article key={o.id} style={{ animationDelay: `${i * 30}ms` }}
              className="bg-surface rounded-3xl p-4 border border-border shadow-card animate-in-up">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-[15px] tracking-tight text-foreground">{o.numero}</h3>
                <AppStatusChip tone={tone(o.status)}>{label(o.status)}</AppStatusChip>
              </div>
              <p className="text-[13px] text-foreground mt-1">{o.cliente}</p>
              {o.cidade && <p className="text-xs text-muted-foreground">{o.cidade}</p>}
              <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
                <span>Início: <span className="text-foreground font-medium">{fmtDate(o.inicio)}</span></span>
                {o.fim_previsto && <span>Fim prev.: <span className="text-foreground font-medium">{fmtDate(o.fim_previsto)}</span></span>}
              </div>
              {o.observacoes && <p className="text-[12px] text-muted-foreground mt-2 line-clamp-2">{o.observacoes}</p>}
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <button onClick={() => { setEditing(o); setFormOpen(true); }}
                  className="flex-1 h-9 rounded-xl bg-muted text-foreground text-[12px] font-medium flex items-center justify-center gap-1.5 active:scale-95">
                  <Pencil className="size-3.5" /> Editar
                </button>
                <button onClick={() => { if (confirm(`Excluir ${o.numero}?`)) del.mutate(o.id); }}
                  className="size-9 grid place-items-center rounded-xl bg-destructive/10 text-destructive active:scale-95">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <OSForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />
    </div>
  );
}
