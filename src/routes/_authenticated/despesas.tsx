import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, SlidersHorizontal, Utensils, Fuel, MapPin, BedDouble, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { AppStatusChip } from "@/components/AppStatusChip";
import { despesas, type CategoriaDespesa } from "@/lib/mock-data";
import { brl, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/despesas")({
  component: DespesasPage,
});

const cats: { key: "todas" | CategoriaDespesa; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "combustivel", label: "Combustível" },
  { key: "almoco", label: "Almoço" },
  { key: "jantar", label: "Jantar" },
  { key: "pedagio", label: "Pedágio" },
  { key: "hospedagem", label: "Hospedagem" },
  { key: "outras", label: "Outras" },
];

const catIcons = { almoco: Utensils, jantar: Utensils, combustivel: Fuel, pedagio: MapPin, hospedagem: BedDouble, outras: MoreHorizontal };
const catColors: Record<CategoriaDespesa, string> = {
  combustivel: "bg-[oklch(0.95_0.05_30)] text-[oklch(0.45_0.2_30)]",
  almoco: "bg-[oklch(0.95_0.05_70)] text-[oklch(0.45_0.15_70)]",
  jantar: "bg-[oklch(0.95_0.06_350)] text-[oklch(0.45_0.18_350)]",
  pedagio: "bg-[oklch(0.95_0.05_230)] text-[oklch(0.45_0.18_230)]",
  hospedagem: "bg-[oklch(0.95_0.05_300)] text-[oklch(0.45_0.18_300)]",
  outras: "bg-muted text-muted-foreground",
};

function DespesasPage() {
  const [cat, setCat] = useState<(typeof cats)[number]["key"]>("todas");
  const [q, setQ] = useState("");

  const list = useMemo(
    () => despesas.filter(d =>
      (cat === "todas" || d.categoria === cat) &&
      (q === "" || d.descricao.toLowerCase().includes(q.toLowerCase()))
    ), [cat, q]
  );

  const total = list.reduce((a, b) => a + b.valor, 0);
  const grouped = list.reduce<Record<string, typeof list>>((acc, d) => {
    (acc[d.data] ??= []).push(d);
    return acc;
  }, {});

  return (
    <div className="animate-in-up">
      <AppTopBar title="Despesas" right={
        <button className="size-10 grid place-items-center rounded-full bg-white/10 active:bg-white/20 ripple">
          <Plus className="size-5" />
        </button>
      } />

      <div className="px-4 pt-4">
        <div className="flex gap-2">
          <label className="flex-1 flex items-center gap-2 h-11 px-3.5 rounded-full bg-muted">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Buscar por descrição ou estabelecimento"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </label>
          <button className="size-11 grid place-items-center rounded-full bg-muted">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex gap-2 mt-3 -mx-4 px-4 overflow-x-auto hide-scrollbar">
          {cats.map(c => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={[
                "px-4 h-9 rounded-full text-[13px] font-medium whitespace-nowrap transition-all",
                cat === c.key ? "bg-primary text-primary-foreground shadow-card" : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="text-right text-[13px] font-semibold text-primary mt-3">Total: {brl(total)}</p>

        <div className="space-y-5 mt-3">
          {Object.entries(grouped).map(([data, items]) => (
            <section key={data}>
              <p className="text-xs font-semibold text-muted-foreground mb-2">{fmtDate(data)}</p>
              <div className="bg-surface rounded-3xl border border-border shadow-card divide-y divide-border overflow-hidden">
                {items.map(d => {
                  const Icon = catIcons[d.categoria];
                  const tone = d.status === "aprovado" ? "success" : d.status === "rascunho" ? "warning" : "info";
                  return (
                    <div key={d.id} className="flex items-center gap-3 p-3.5 ripple">
                      <span className={`size-10 grid place-items-center rounded-full shrink-0 ${catColors[d.categoria]}`}>
                        <Icon className="size-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{d.descricao}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{d.os}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-semibold text-foreground">{brl(d.valor)}</p>
                        <AppStatusChip tone={tone} size="xs">{d.status}</AppStatusChip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
