import { createFileRoute } from "@tanstack/react-router";
import { Plus, Clock as ClockIcon } from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";
import { AppStatusChip } from "@/components/AppStatusChip";
import { horas } from "@/lib/mock-data";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/horas")({
  component: HorasPage,
});

function HorasPage() {
  const grouped = horas.reduce<Record<string, typeof horas>>((acc, h) => {
    (acc[h.data] ??= []).push(h);
    return acc;
  }, {});
  const totalMin = horas.reduce((acc, h) => {
    const [hh, mm] = h.total.replace("h ", " ").replace("m", "").split(" ").map(Number);
    return acc + hh * 60 + mm;
  }, 0);
  const totalStr = `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;

  return (
    <div className="animate-in-up">
      <AppTopBar title="Registro de Horas" right={
        <button className="size-10 grid place-items-center rounded-full bg-white/10 active:bg-white/20 ripple">
          <Plus className="size-5" />
        </button>
      } />

      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
          {["Todas as OS", "Todos os tipos", "Este mês"].map(t => (
            <button key={t} className="px-3.5 h-9 rounded-full bg-muted text-muted-foreground text-[13px] font-medium whitespace-nowrap">
              {t} ▾
            </button>
          ))}
        </div>

        <p className="text-right text-[15px] font-bold text-primary mt-4">Total: 128h 30m</p>

        <div className="space-y-5 mt-4">
          {Object.entries(grouped).map(([data, items]) => (
            <section key={data}>
              <p className="text-xs font-semibold text-muted-foreground mb-2">{fmtDate(data)}</p>
              <div className="space-y-3">
                {items.map(h => {
                  const tone = h.tipo === "Hora Extra" ? "warning" : h.tipo === "Deslocamento" ? "info" : "success";
                  return (
                    <article key={h.id} className="bg-surface rounded-3xl p-4 border border-border shadow-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-7 grid place-items-center rounded-lg bg-primary-container text-primary-container-foreground">
                            <ClockIcon className="size-3.5" />
                          </span>
                          <span className="text-[13px] font-semibold">{h.os}</span>
                        </div>
                        <AppStatusChip tone={tone} size="xs">{h.tipo}</AppStatusChip>
                      </div>
                      <div className="mt-3 space-y-0.5">
                        <p className="text-[13px] text-foreground"><span className="font-semibold">{h.inicio} - {h.fim}</span></p>
                        <p className="text-[12px] text-muted-foreground">Intervalo: {h.intervalo}</p>
                        <p className="text-[13px] text-foreground"><span className="font-semibold">Total: {h.total}</span></p>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground mt-2.5 leading-relaxed">{h.obs}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="hidden">{totalStr}</div>
      </div>
    </div>
  );
}
