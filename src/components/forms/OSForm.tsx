import { useState, useEffect, type FormEvent } from "react";
import { AppDrawer, FormField, inputCls } from "@/components/AppDrawer";
import { useUpsertOS, type OSRow } from "@/lib/db";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: OSRow | null;
}

export function OSForm({ open, onClose, initial }: Props) {
  const upsert = useUpsertOS();
  const [numero, setNumero] = useState("");
  const [cliente, setCliente] = useState("");
  const [cidade, setCidade] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [status, setStatus] = useState<OSRow["status"]>("aberta");
  const [obs, setObs] = useState("");

  useEffect(() => {
    if (open) {
      setNumero(initial?.numero ?? `OS ${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`);
      setCliente(initial?.cliente ?? "");
      setCidade(initial?.cidade ?? "");
      setInicio(initial?.inicio ?? new Date().toISOString().slice(0, 10));
      setFim(initial?.fim_previsto ?? "");
      setStatus(initial?.status ?? "aberta");
      setObs(initial?.observacoes ?? "");
    }
  }, [open, initial]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await upsert.mutateAsync({
      id: initial?.id,
      numero,
      cliente,
      cidade,
      inicio,
      fim_previsto: fim || null,
      status,
      observacoes: obs || null,
    });
    onClose();
  };

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={initial ? "Editar OS" : "Nova OS"}
      footer={
        <button
          form="os-form"
          type="submit"
          disabled={upsert.isPending}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] shadow-fab active:scale-[0.99] disabled:opacity-60"
        >
          {upsert.isPending ? "Salvando..." : "Salvar OS"}
        </button>
      }
    >
      <form id="os-form" onSubmit={submit} className="space-y-3">
        <FormField label="Número da OS">
          <input className={inputCls} value={numero} onChange={(e) => setNumero(e.target.value)} required />
        </FormField>
        <FormField label="Cliente">
          <input className={inputCls} value={cliente} onChange={(e) => setCliente(e.target.value)} required />
        </FormField>
        <FormField label="Cidade / UF">
          <input className={inputCls} value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="São Paulo / SP" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Início">
            <input type="date" className={inputCls} value={inicio} onChange={(e) => setInicio(e.target.value)} required />
          </FormField>
          <FormField label="Fim previsto">
            <input type="date" className={inputCls} value={fim} onChange={(e) => setFim(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Status">
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as OSRow["status"])}>
            <option value="aberta">Aberta</option>
            <option value="em_andamento">Em andamento</option>
            <option value="encerrada">Encerrada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </FormField>
        <FormField label="Observações">
          <textarea
            className={`${inputCls} h-24 py-2.5 resize-none`}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
        </FormField>
      </form>
    </AppDrawer>
  );
}
