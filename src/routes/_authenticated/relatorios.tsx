import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Share2, Download } from "lucide-react";
import { toast } from "sonner";
import { AppTopBar } from "@/components/AppTopBar";
import { useOSList, useDespesas, useHoras, useAdiantamentos, useRelatorios, useAddRelatorio, useProfile } from "@/lib/db";
import { gerarRelatorioPDF, baixarBlob } from "@/lib/pdf";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/relatorios")({ component: RelatoriosPage });

function RelatoriosPage() {
  const { data: osList = [] } = useOSList();
  const { data: despesas = [] } = useDespesas();
  const { data: horas = [] } = useHoras();
  const { data: ads = [] } = useAdiantamentos();
  const { data: relatorios = [] } = useRelatorios();
  const { data: profile } = useProfile();
  const addRel = useAddRelatorio();

  const [tipo, setTipo] = useState<"os" | "mensal">("os");
  const [osId, setOsId] = useState<string>("");
  const [inicio, setInicio] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [fim, setFim] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [lastPdf, setLastPdf] = useState<{ blob: Blob; filename: string } | null>(null);

  const gerar = async () => {
    setLoading(true);
    try {
      const inDate = (d: string) => d >= inicio && d <= fim;
      const os = osId ? osList.find(o => o.id === osId) : null;
      const desp = despesas.filter(d => (!osId || d.os_id === osId) && inDate(d.data));
      const hrs = horas.filter(h => (!osId || h.os_id === osId) && inDate(h.data));
      const adts = ads.filter(a => (!osId || a.os_id === osId) && inDate(a.data));

      const titulo = tipo === "os" && os
        ? `${os.numero} - ${fmtDate(inicio)} a ${fmtDate(fim)}`
        : `Relatório ${fmtDate(inicio)} a ${fmtDate(fim)}`;

      const pdf = gerarRelatorioPDF({
        titulo, periodoInicio: inicio, periodoFim: fim, os,
        despesas: desp, horas: hrs, adiantamentos: adts,
        usuario: profile?.full_name ?? undefined,
      });
      baixarBlob(pdf.blob, pdf.filename);
      setLastPdf(pdf);
      await addRel.mutateAsync({ titulo, tipo, os_id: osId || null, periodo_inicio: inicio, periodo_fim: fim });
      toast.success("Relatório gerado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar");
    } finally {
      setLoading(false);
    }
  };

  const compartilhar = async () => {
    if (!lastPdf) { toast.error("Gere um relatório primeiro"); return; }
    const file = new File([lastPdf.blob], lastPdf.filename, { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "Relatório ViagemCorp" }); }
      catch { /* user cancel */ }
    } else {
      baixarBlob(lastPdf.blob, lastPdf.filename);
      toast.info("Compartilhamento não suportado — PDF baixado");
    }
  };

  return (
    <div className="animate-in-up">
      <AppTopBar title="Relatórios" variant="back" />
      <div className="px-4 pt-5 space-y-4">
        <Field label="Tipo de relatório">
          <select value={tipo} onChange={e => setTipo(e.target.value as "os" | "mensal")} className="w-full h-12 px-4 rounded-2xl bg-input border border-border text-[14px]">
            <option value="os">Por OS</option>
            <option value="mensal">Período</option>
          </select>
        </Field>
        {tipo === "os" && (
          <Field label="Selecione a OS">
            <select value={osId} onChange={e => setOsId(e.target.value)} className="w-full h-12 px-4 rounded-2xl bg-input border border-border text-[14px]">
              <option value="">— Todas as OS —</option>
              {osList.map(o => <option key={o.id} value={o.id}>{o.numero} · {o.cliente}</option>)}
            </select>
          </Field>
        )}
        <Field label="Período">
          <div className="flex gap-2">
            <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} className="flex-1 h-12 px-3 rounded-2xl bg-input border border-border text-[14px]" />
            <span className="self-center text-xs text-muted-foreground">até</span>
            <input type="date" value={fim} onChange={e => setFim(e.target.value)} className="flex-1 h-12 px-3 rounded-2xl bg-input border border-border text-[14px]" />
          </div>
        </Field>

        <button onClick={gerar} disabled={loading}
          className="w-full h-12 mt-2 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] shadow-fab active:scale-[0.99] disabled:opacity-70">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="size-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              Gerando PDF…
            </span>
          ) : "Gerar Relatório em PDF"}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={compartilhar} disabled={!lastPdf}
            className="h-11 rounded-2xl bg-surface border border-border text-[13px] font-medium flex items-center justify-center gap-2 shadow-card disabled:opacity-50">
            <Share2 className="size-4" /> Compartilhar
          </button>
          <button onClick={() => lastPdf && baixarBlob(lastPdf.blob, lastPdf.filename)} disabled={!lastPdf}
            className="h-11 rounded-2xl bg-surface border border-border text-[13px] font-medium flex items-center justify-center gap-2 shadow-card disabled:opacity-50">
            <Download className="size-4" /> Baixar novamente
          </button>
        </div>

        <section className="pt-3">
          <h2 className="font-semibold tracking-tight mb-3">Histórico</h2>
          {relatorios.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6 bg-surface rounded-3xl border border-border">
              Nenhum relatório gerado ainda.
            </p>
          ) : (
            <div className="bg-surface rounded-3xl border border-border shadow-card divide-y divide-border overflow-hidden">
              {relatorios.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3.5">
                  <span className="size-9 rounded-xl grid place-items-center bg-primary-container text-primary-container-foreground">
                    <FileText className="size-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{r.titulo}</p>
                    <p className="text-[11px] text-muted-foreground">Gerado em {new Date(r.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
      {children}
    </div>
  );
}
