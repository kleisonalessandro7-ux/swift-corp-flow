import { useEffect, useState, type FormEvent } from "react";
import { AppDrawer, FormField, inputCls } from "@/components/AppDrawer";
import { useOSList, useUpsertAdiantamento, type AdiantamentoRow } from "@/lib/db";
import type { Database } from "@/integrations/supabase/types";

type Status = Database["public"]["Enums"]["adiantamento_status"];

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: AdiantamentoRow | null;
}

export function AdiantamentoForm({ open, onClose, initial }: Props) {
  const upsert = useUpsertAdiantamento();
  const { data: osList } = useOSList();
  const [osId, setOsId] = useState("");
  const [cliente, setCliente] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [solicitado, setSolicitado] = useState("");
  const [recebido, setRecebido] = useState("0");
  const [data, setData] = useState("");
  const [status, setStatus] = useState<Status>("pendente");
  const [obs, setObs] = useState("");

  useEffect(() => {
    if (open) {
      setOsId(initial?.os_id ?? "");
      setCliente(initial?.cliente ?? "");
      setPeriodo(initial?.periodo ?? "");
      setSolicitado(initial ? String(initial.solicitado) : "");
      setRecebido(initial ? String(initial.recebido) : "0");
      setData(initial?.data ?? new Date().toISOString().slice(0, 10));
      setStatus(initial?.status ?? "pendente");
      setObs(initial?.observacao ?? "");
    }
  }, [open, initial]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await upsert.mutateAsync({
      id: initial?.id,
      os_id: osId || null,
      cliente: cliente || null,
      periodo: periodo || null,
      solicitado: parseFloat(solicitado.replace(",", ".")) || 0,
      recebido: parseFloat(recebido.replace(",", ".")) || 0,
      data,
      status,
      observacao: obs || null,
    });
    onClose();
  };

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={initial ? "Editar adiantamento" : "Solicitar adiantamento"}
      footer={
        <button
          form="ad-form"
          type="submit"
          disabled={upsert.isPending}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] shadow-fab active:scale-[0.99] disabled:opacity-60"
        >
          {upsert.isPending ? "Salvando..." : "Salvar"}
        </button>
      }
    >
      <form id="ad-form" onSubmit={submit} className="space-y-3">
        <FormField label="OS">
          <select
            className={inputCls}
            value={osId}
            onChange={(e) => {
              setOsId(e.target.value);
              const o = osList?.find((x) => x.id === e.target.value);
              if (o && !cliente) setCliente(o.cliente);
            }}
          >
            <option value="">— Nenhuma —</option>
            {osList?.map((o) => (
              <option key={o.id} value={o.id}>{o.numero} · {o.cliente}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Cliente">
          <input className={inputCls} value={cliente} onChange={(e) => setCliente(e.target.value)} />
        </FormField>
        <FormField label="Período">
          <input className={inputCls} value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="20/05 a 28/05/2025" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Solicitado (R$)">
            <input type="text" inputMode="decimal" className={inputCls} value={solicitado} onChange={(e) => setSolicitado(e.target.value)} required />
          </FormField>
          <FormField label="Recebido (R$)">
            <input type="text" inputMode="decimal" className={inputCls} value={recebido} onChange={(e) => setRecebido(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Data da solicitação">
          <input type="date" className={inputCls} value={data} onChange={(e) => setData(e.target.value)} required />
        </FormField>
        <FormField label="Status">
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="recebido">Recebido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </FormField>
        <FormField label="Observação">
          <textarea className={`${inputCls} h-20 py-2.5 resize-none`} value={obs} onChange={(e) => setObs(e.target.value)} />
        </FormField>
      </form>
    </AppDrawer>
  );
}
