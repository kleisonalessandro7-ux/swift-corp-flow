import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { AppStatusChip } from "@/components/AppStatusChip";
import { osList, type OS, type OSStatus } from "@/lib/mock-data";
import { brl, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/os")({
  component: OSPage,
});

const filters: { key: "todas" | OSStatus; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "aberta", label: "Aberta" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "encerrada", label: "Encerrada" },
  { key: "cancelada", label: "Cancelada" },
];

function statusTone(s: OSStatus) {
  return s === "em_andamento" ? "success" : s === "aberta" ? "warning" : s === "encerrada" ? "info" : "destructive";
}
function statusLabel(s: OSStatus) {
  return s === "em_andamento" ? "Em andamento" : s === "aberta" ? "Aberta" : s === "encerrada" ? "Encerrada" : "Cancelada";
}

function OSPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("todas");
  const [q, setQ] = useState("");
  const list = useMemo(
    () => osList.filter(o =>
      (filter === "todas" || o.status === filter) &&
      (q === "" || `${o.numero} ${o.cliente}`.toLowerCase().includes(q.toLowerCase()))
    ),
    [filter, q]
  );

  return (
    <div className="animate-in-up">
      <AppTopBar title="Ordens de Serviço" right={
        <button className="size-10 grid place-items-center rounded-full bg-white/10 active:bg-white/20 ripple">
          <Plus className="size-5" />
        </button>
      } />

      <div className="px-4 pt-4">
        <div className="flex gap-2">
          <label className="flex-1 flex items-center gap-2 h-11 px-3.5 rounded-full bg-muted">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por nº da OS ou cliente"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </label>
          <button className="size-11 grid place-items-center rounded-full bg-muted">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex gap-2 mt-3 -mx-4 px-4 overflow-x-auto hide-scrollbar">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={[
                "px-4 h-9 rounded-full text-[13px] font-medium whitespace-nowrap transition-all",
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 mt-4">
          {list.map((o, i) => <OSCard key={o.id} o={o} delay={i * 30} />)}
          {list.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">Nenhuma OS encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OSCard({ o, delay }: { o: OS; delay: number }) {
  return (
    <article
      style={{ animationDelay: `${delay}ms` }}
      className="bg-surface rounded-3xl p-4 border border-border shadow-card animate-in-up"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-[15px] tracking-tight text-foreground">{o.numero}</h3>
        <AppStatusChip tone={statusTone(o.status)}>{statusLabel(o.status)}</AppStatusChip>
      </div>
      <p className="text-[13px] text-foreground mt-1">{o.cliente}</p>
      <p className="text-xs text-muted-foreground">{o.cidade}</p>

      <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
        <span>Início: <span className="text-foreground font-medium">{fmtDate(o.inicio)}</span></span>
        <span>Fim prev.: <span className="text-foreground font-medium">{fmtDate(o.fimPrevisto)}</span></span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
        <Stat label="Horas" value={o.horas} />
        <Stat label="Despesas" value={brl(o.despesas)} />
        <Stat label="Adiantamento" value={brl(o.adiantamento)} />
      </div>

      <p className="text-[11px] text-muted-foreground mt-3">Atualizado {o.atualizadoHa}</p>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] text-muted-foreground">{label}</p>
      <p className="text-[12.5px] font-semibold text-foreground tracking-tight mt-0.5">{value}</p>
    </div>
  );
}
