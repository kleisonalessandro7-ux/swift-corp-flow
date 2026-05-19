import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, FileText, Share2, Mail, Download } from "lucide-react";
import { toast } from "sonner";
import { AppTopBar } from "@/components/AppTopBar";
import { relatoriosGerados } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const [loading, setLoading] = useState(false);
  const gerar = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    toast.success("Relatório gerado com sucesso!");
  };

  return (
    <div className="animate-in-up">
      <AppTopBar title="Relatórios" variant="back" />
      <div className="px-4 pt-5 space-y-4">
        <Field label="Tipo de relatório">
          <Select>Por OS</Select>
        </Field>
        <Field label="Selecione a OS">
          <Select>OS 2025-015 - Empresa ABC Ltda</Select>
        </Field>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Período</p>
          <div className="flex gap-2">
            <DateBox value="20/05/2025" />
            <span className="self-center text-xs text-muted-foreground">até</span>
            <DateBox value="28/05/2025" />
          </div>
        </div>

        <button
          onClick={gerar}
          disabled={loading}
          className="w-full h-12 mt-2 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] shadow-fab active:scale-[0.99] disabled:opacity-70 relative overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="size-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              Gerando PDF…
            </span>
          ) : (
            "Gerar Relatório em PDF"
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button className="h-11 rounded-2xl bg-surface border border-border text-[13px] font-medium flex items-center justify-center gap-2 shadow-card">
            <Share2 className="size-4" /> Compartilhar
          </button>
          <button className="h-11 rounded-2xl bg-surface border border-border text-[13px] font-medium flex items-center justify-center gap-2 shadow-card">
            <Mail className="size-4" /> Enviar por e-mail
          </button>
        </div>

        <section className="pt-3">
          <h2 className="font-semibold tracking-tight mb-3">Relatórios gerados</h2>
          <div className="bg-surface rounded-3xl border border-border shadow-card divide-y divide-border overflow-hidden">
            {relatoriosGerados.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3.5">
                <span className="size-9 rounded-xl grid place-items-center bg-primary-container text-primary-container-foreground">
                  <FileText className="size-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{r.titulo}</p>
                  <p className="text-[11px] text-muted-foreground">Gerado em {r.quando}</p>
                </div>
                <button className="size-8 grid place-items-center rounded-full text-muted-foreground active:bg-muted">
                  <Download className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] text-primary font-semibold mt-4">Ver todos os relatórios</p>
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
function Select({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-12 px-4 rounded-2xl bg-input border border-border flex items-center justify-between text-[14px]">
      <span className="text-foreground truncate">{children}</span>
      <ChevronDown className="size-4 text-muted-foreground shrink-0" />
    </div>
  );
}
function DateBox({ value }: { value: string }) {
  return (
    <div className="flex-1 h-12 px-4 rounded-2xl bg-input border border-border flex items-center text-[14px] text-foreground">
      {value}
    </div>
  );
}
