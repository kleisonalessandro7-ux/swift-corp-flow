import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Utensils, Fuel, MapPin, BedDouble, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { AppStatusChip } from "@/components/AppStatusChip";
import { DespesaForm } from "@/components/forms/DespesaForm";
import { useDespesas, useDeleteDespesa, type DespesaRow } from "@/lib/db";
import { brl, fmtDate } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/despesas")({ component: DespesasPage });

type Cat = Database["public"]["Enums"]["despesa_categoria"];
const cats: { key: "todas" | Cat; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "combustivel", label: "Combustível" },
  { key: "almoco", label: "Almoço" },
  { key: "jantar", label: "Jantar" },
  { key: "pedagio", label: "Pedágio" },
  { key: "hospedagem", label: "Hospedagem" },
  { key: "outras", label: "Outras" },
];
const catIcons: Record<Cat, typeof Utensils> = { almoco: Utensils, jantar: Utensils, combustivel: Fuel, pedagio: MapPin, hospedagem: BedDouble, outras: MoreHorizontal };

function DespesasPage() {
  const { data: list = [], isLoading } = useDespesas();
  const del = useDeleteDespesa();
  const [cat, setCat] = useState<(typeof cats)[number]["key"]>("todas");
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DespesaRow | null>(null);

  const filtered = useMemo(() => list.filter(d =>
    (cat === "todas" || d.categoria === cat) &&
    (q === "" || d.descricao.toLowerCase().includes(q.toLowerCase()) || (d.estabelecimento ?? "").toLowerCase().includes(q.toLowerCase()))
  ), [list, cat, q]);

  const total = filtered.reduce((a, b) => a + Number(b.valor), 0);
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, d) => { (acc[d.data] ??= []).push(d); return acc; }, {});

  return (
    <div className="animate-in-up">
      <AppTopBar title="Despesas" right={
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="size-10 grid place-items-center rounded-full bg-white/10 active:bg-white/20 ripple">
          <Plus className="size-5" />
        </button>
      } />
      <div className="px-4 pt-4">
        <label className="flex items-center gap-2 h-11 px-3.5 rounded-full bg-muted">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
        </label>
        <div className="flex gap-2 mt-3 -mx-4 px-4 overflow-x-auto hide-scrollbar">
          {cats.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className={["px-4 h-9 rounded-full text-[13px] font-medium whitespace-nowrap transition-all",
                cat === c.key ? "bg-primary text-primary-foreground shadow-card" : "bg-muted text-muted-foreground"].join(" ")}>
              {c.label}
            </button>
          ))}
        </div>
        <p className="text-right text-[13px] font-semibold text-primary mt-3">Total: {brl(total)}</p>

        {isLoading && <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Nenhuma despesa.</p>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="mt-3 inline-flex items-center gap-2 px-4 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              <Plus className="size-4" /> Adicionar despesa
            </button>
          </div>
        )}

        <div className="space-y-5 mt-3">
          {Object.entries(grouped).map(([data, items]) => (
            <section key={data}>
              <p className="text-xs font-semibold text-muted-foreground mb-2">{fmtDate(data)}</p>
              <div className="bg-surface rounded-3xl border border-border shadow-card divide-y divide-border overflow-hidden">
                {items.map(d => {
                  const Icon = catIcons[d.categoria];
                  const t = d.status === "aprovado" ? "success" : d.status === "rascunho" ? "warning" : d.status === "rejeitado" ? "destructive" : "info";
                  return (
                    <div key={d.id} className="flex items-center gap-3 p-3.5">
                      <span className="size-10 grid place-items-center rounded-full shrink-0 bg-primary-container text-primary-container-foreground">
                        <Icon className="size-4" />
                      </span>
                      <button onClick={() => { setEditing(d); setFormOpen(true); }} className="flex-1 min-w-0 text-left">
                        <p className="text-[13px] font-medium text-foreground truncate">{d.descricao}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{d.ordens_servico?.numero ?? "Sem OS"}{d.estabelecimento ? ` · ${d.estabelecimento}` : ""}</p>
                      </button>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-semibold text-foreground">{brl(Number(d.valor))}</p>
                        <AppStatusChip tone={t} size="xs">{d.status}</AppStatusChip>
                      </div>
                      <button onClick={() => { if (confirm("Excluir?")) del.mutate(d.id); }}
                        className="size-8 grid place-items-center rounded-full text-muted-foreground active:bg-destructive/10 active:text-destructive">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
      <DespesaForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />
    </div>
  );
}
