import { useEffect, useState, type FormEvent } from "react";
import { AppDrawer, FormField, inputCls } from "@/components/AppDrawer";
import { useAddVRUso, useVRConfig } from "@/lib/db";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function VRUsoForm({ open, onClose }: Props) {
  const add = useAddVRUso();
  const { data: cfg } = useVRConfig();
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (open) {
      setValor(cfg ? String(cfg.valor_diario) : "45");
      setData(new Date().toISOString().slice(0, 10));
      setDesc("");
    }
  }, [open, cfg]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await add.mutateAsync({
      valor: parseFloat(valor.replace(",", ".")) || 0,
      data,
      descricao: desc || undefined,
    });
    onClose();
  };

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title="Registrar uso do VR"
      footer={
        <button
          form="vr-form"
          type="submit"
          disabled={add.isPending}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] shadow-fab active:scale-[0.99] disabled:opacity-60"
        >
          {add.isPending ? "Salvando..." : "Registrar"}
        </button>
      }
    >
      <form id="vr-form" onSubmit={submit} className="space-y-3">
        <FormField label="Valor (R$)">
          <input type="text" inputMode="decimal" className={inputCls} value={valor} onChange={(e) => setValor(e.target.value)} required />
        </FormField>
        <FormField label="Data">
          <input type="date" className={inputCls} value={data} onChange={(e) => setData(e.target.value)} required />
        </FormField>
        <FormField label="Descrição (opcional)">
          <input className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Almoço, jantar..." />
        </FormField>
      </form>
    </AppDrawer>
  );
}
