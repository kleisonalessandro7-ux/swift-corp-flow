import { createFileRoute } from "@tanstack/react-router";
import { Plus, Clock as ClockIcon, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { AppStatusChip } from "@/components/AppStatusChip";
import { HoraForm } from "@/components/forms/HoraForm";
import { useHoras, useDeleteHora, type HoraRow } from "@/lib/db";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/horas")({ component: HorasPage });

function totalMin(h: HoraRow) {
  const [h1, m1] = h.inicio.split(":").map(Number);
  const [h2, m2] = h.fim.split(":").map(Number);
  return Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1) - (h.intervalo_min ?? 0));
}
const fmtTotal = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
const tipoLabel: Record<HoraRow["tipo"], string> = { normal: "Normal", hora_extra: "Hora Extra", deslocamento: "Deslocamento" };

function HorasPage() {
  const { data: list = [], isLoading } = useHoras();
  const del = useDeleteHora();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HoraRow | null>(null);

  const grouped = list.reduce<Record<string, typeof list>>((acc, h) => { (acc[h.data] ??= []).push(h); return acc; }, {});
  const totMin = list.reduce((a, b) => a + totalMin(b), 0);

  return (
    <div className="animate-in-up">
      <AppTopBar title="Registro de Horas" right={
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="size-10 grid place-items-center rounded-full bg-white/10 active:bg-white/20 ripple">
          <Plus className="size-5" />
        </button>
      } />
      <div className="px-4 pt-4">
        <p className="text-right text-[15px] font-bold text-primary mt-2">Total: {fmtTotal(totMin)}</p>

        {isLoading && <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>}
        {!isLoading && list.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Sem registros este mês.</p>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="mt-3 inline-flex items-center gap-2 px-4 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              <Plus className="size-4" /> Registrar horas
            </button>
          </div>
        )}

        <div className="space-y-5 mt-4">
          {Object.entries(grouped).map(([data, items]) => (
            <section key={data}>
              <p className="text-xs font-semibold text-muted-foreground mb-2">{fmtDate(data)}</p>
              <div className="space-y-3">
                {items.map(h => {
                  const tm = totalMin(h);
                  const tone = h.tipo === "hora_extra" ? "warning" : h.tipo === "deslocamento" ? "info" : "success";
                  return (
                    <article key={h.id} className="bg-surface rounded-3xl p-4 border border-border shadow-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-7 grid place-items-center rounded-lg bg-primary-container text-primary-container-foreground">
                            <ClockIcon className="size-3.5" />
                          </span>
                          <span className="text-[13px] font-semibold">{h.ordens_servico?.numero ?? "Sem OS"}</span>
                        </div>
                        <AppStatusChip tone={tone} size="xs">{tipoLabel[h.tipo]}</AppStatusChip>
                      </div>
                      <div className="mt-3 space-y-0.5">
                        <p className="text-[13px]"><span className="font-semibold">{h.inicio.slice(0,5)} - {h.fim.slice(0,5)}</span></p>
                        <p className="text-[12px] text-muted-foreground">Intervalo: {h.intervalo_min} min</p>
                        <p className="text-[13px]"><span className="font-semibold">Total: {fmtTotal(tm)}</span></p>
                      </div>
                      {h.observacao && <p className="text-[11.5px] text-muted-foreground mt-2.5 leading-relaxed">{h.observacao}</p>}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <button onClick={() => { setEditing(h); setFormOpen(true); }}
                          className="flex-1 h-9 rounded-xl bg-muted text-[12px] font-medium flex items-center justify-center gap-1.5">
                          <Pencil className="size-3.5" /> Editar
                        </button>
                        <button onClick={() => { if (confirm("Excluir?")) del.mutate(h.id); }}
                          className="size-9 grid place-items-center rounded-xl bg-destructive/10 text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
      <HoraForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />
    </div>
  );
}
