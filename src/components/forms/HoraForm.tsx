import { useEffect, useState, type FormEvent } from "react";
import { AppDrawer, FormField, inputCls } from "@/components/AppDrawer";
import { useOSList, useUpsertHora, type HoraRow } from "@/lib/db";
import type { Database } from "@/integrations/supabase/types";

type Tipo = Database["public"]["Enums"]["hora_tipo"];

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: HoraRow | null;
}

export function HoraForm({ open, onClose, initial }: Props) {
  const upsert = useUpsertHora();
  const { data: osList } = useOSList();
  const [osId, setOsId] = useState("");
  const [data, setData] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [intervalo, setIntervalo] = useState("60");
  const [tipo, setTipo] = useState<Tipo>("normal");
  const [obs, setObs] = useState("");

  useEffect(() => {
    if (open) {
      setOsId(initial?.os_id ?? "");
      setData(initial?.data ?? new Date().toISOString().slice(0, 10));
      setInicio(initial?.inicio?.slice(0, 5) ?? "08:00");
      setFim(initial?.fim?.slice(0, 5) ?? "17:00");
      setIntervalo(String(initial?.intervalo_min ?? 60));
      setTipo(initial?.tipo ?? "normal");
      setObs(initial?.observacao ?? "");
    }
  }, [open, initial]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await upsert.mutateAsync({
      id: initial?.id,
      os_id: osId || null,
      data,
      inicio,
      fim,
      intervalo_min: parseInt(intervalo) || 0,
      tipo,
      observacao: obs || null,
    });
    onClose();
  };

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={initial ? "Editar horas" : "Registrar horas"}
      footer={
        <button
          form="hora-form"
          type="submit"
          disabled={upsert.isPending}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] shadow-fab active:scale-[0.99] disabled:opacity-60"
        >
          {upsert.isPending ? "Salvando..." : "Salvar registro"}
        </button>
      }
    >
      <form id="hora-form" onSubmit={submit} className="space-y-3">
        <FormField label="OS">
          <select className={inputCls} value={osId} onChange={(e) => setOsId(e.target.value)}>
            <option value="">— Nenhuma —</option>
            {osList?.map((o) => (
              <option key={o.id} value={o.id}>{o.numero} · {o.cliente}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Data">
          <input type="date" className={inputCls} value={data} onChange={(e) => setData(e.target.value)} required />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Início">
            <input type="time" className={inputCls} value={inicio} onChange={(e) => setInicio(e.target.value)} required />
          </FormField>
          <FormField label="Fim">
            <input type="time" className={inputCls} value={fim} onChange={(e) => setFim(e.target.value)} required />
          </FormField>
        </div>
        <FormField label="Intervalo (minutos)">
          <input type="number" min="0" className={inputCls} value={intervalo} onChange={(e) => setIntervalo(e.target.value)} />
        </FormField>
        <FormField label="Tipo">
          <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)}>
            <option value="normal">Normal</option>
            <option value="hora_extra">Hora Extra</option>
            <option value="deslocamento">Deslocamento</option>
          </select>
        </FormField>
        <FormField label="Observação">
          <textarea className={`${inputCls} h-20 py-2.5 resize-none`} value={obs} onChange={(e) => setObs(e.target.value)} />
        </FormField>
      </form>
    </AppDrawer>
  );
}
