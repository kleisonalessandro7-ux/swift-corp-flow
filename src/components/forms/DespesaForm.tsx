import { useState, useEffect, type FormEvent, useRef } from "react";
import { Camera, Loader2, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { AppDrawer, FormField, inputCls } from "@/components/AppDrawer";
import { useUpsertDespesa, useOSList, type DespesaRow } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { ocrComprovante } from "@/lib/ocr.functions";
import type { Database } from "@/integrations/supabase/types";

type Categoria = Database["public"]["Enums"]["despesa_categoria"];

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: DespesaRow | null;
}

export function DespesaForm({ open, onClose, initial }: Props) {
  const upsert = useUpsertDespesa();
  const { data: osList } = useOSList();
  const fileRef = useRef<HTMLInputElement>(null);

  const [descricao, setDescricao] = useState("");
  const [estabelecimento, setEstabelecimento] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("outras");
  const [osId, setOsId] = useState<string>("");
  const [status, setStatus] = useState<DespesaRow["status"]>("rascunho");
  const [comprovante, setComprovante] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setDescricao(initial?.descricao ?? "");
      setEstabelecimento(initial?.estabelecimento ?? "");
      setValor(initial ? String(initial.valor) : "");
      setData(initial?.data ?? new Date().toISOString().slice(0, 10));
      setCategoria(initial?.categoria ?? "outras");
      setOsId(initial?.os_id ?? "");
      setStatus(initial?.status ?? "rascunho");
      setComprovante(initial?.comprovante_url ?? null);
    }
  }, [open, initial]);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${u.user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("comprovantes").upload(path, file, { upsert: true });
      if (error) throw error;
      setComprovante(path);
      toast.success("Comprovante enviado");

      // OCR auto
      setOcrLoading(true);
      try {
        const reader = new FileReader();
        const dataUrl: string = await new Promise((res, rej) => {
          reader.onload = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
        const ocr = await ocrComprovante({ data: { imageBase64: dataUrl } });
        if (ocr.estabelecimento) setEstabelecimento(ocr.estabelecimento);
        if (ocr.valor) setValor(String(ocr.valor));
        if (ocr.data) setData(ocr.data);
        if (ocr.categoria) setCategoria(ocr.categoria as Categoria);
        if (ocr.descricao && !descricao) setDescricao(ocr.descricao);
        toast.success("Dados extraídos do comprovante");
      } catch (e) {
        const m = e instanceof Error ? e.message : "OCR falhou";
        toast.error(m);
      } finally {
        setOcrLoading(false);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await upsert.mutateAsync({
      id: initial?.id,
      descricao,
      estabelecimento: estabelecimento || null,
      valor: parseFloat(valor.replace(",", ".")) || 0,
      data,
      categoria,
      os_id: osId || null,
      status,
      comprovante_url: comprovante,
    });
    onClose();
  };

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={initial ? "Editar despesa" : "Nova despesa"}
      footer={
        <button
          form="despesa-form"
          type="submit"
          disabled={upsert.isPending}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] shadow-fab active:scale-[0.99] disabled:opacity-60"
        >
          {upsert.isPending ? "Salvando..." : "Salvar despesa"}
        </button>
      }
    >
      <form id="despesa-form" onSubmit={submit} className="space-y-3">
        {/* OCR comprovante */}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {comprovante ? (
            <div className="relative rounded-2xl overflow-hidden border border-border">
              <ComprovantePreview path={comprovante} />
              <button
                type="button"
                onClick={() => setComprovante(null)}
                className="absolute top-2 right-2 size-8 grid place-items-center rounded-full bg-black/60 text-white"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || ocrLoading}
              className="w-full h-28 rounded-2xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-1.5 text-muted-foreground active:bg-muted disabled:opacity-60"
            >
              {uploading || ocrLoading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span className="text-[12px]">{ocrLoading ? "Lendo comprovante..." : "Enviando..."}</span>
                </>
              ) : (
                <>
                  <Camera className="size-6" />
                  <span className="text-[12px] font-medium">Fotografar comprovante</span>
                  <span className="text-[10px]">OCR automático com IA</span>
                </>
              )}
            </button>
          )}
        </div>

        <FormField label="Descrição">
          <input className={inputCls} value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Valor (R$)">
            <input
              type="text"
              inputMode="decimal"
              className={inputCls}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              required
            />
          </FormField>
          <FormField label="Data">
            <input type="date" className={inputCls} value={data} onChange={(e) => setData(e.target.value)} required />
          </FormField>
        </div>

        <FormField label="Categoria">
          <select className={inputCls} value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
            <option value="combustivel">Combustível</option>
            <option value="almoco">Almoço</option>
            <option value="jantar">Jantar</option>
            <option value="pedagio">Pedágio</option>
            <option value="hospedagem">Hospedagem</option>
            <option value="outras">Outras</option>
          </select>
        </FormField>

        <FormField label="Estabelecimento">
          <input className={inputCls} value={estabelecimento} onChange={(e) => setEstabelecimento(e.target.value)} />
        </FormField>

        <FormField label="OS vinculada">
          <select className={inputCls} value={osId} onChange={(e) => setOsId(e.target.value)}>
            <option value="">— Nenhuma —</option>
            {osList?.map((o) => (
              <option key={o.id} value={o.id}>{o.numero} · {o.cliente}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Status">
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as DespesaRow["status"])}>
            <option value="rascunho">Rascunho</option>
            <option value="enviado">Enviado</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
          </select>
        </FormField>
      </form>
    </AppDrawer>
  );
}

function ComprovantePreview({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.storage.from("comprovantes").createSignedUrl(path, 600).then(({ data }) => {
      setUrl(data?.signedUrl ?? null);
    });
  }, [path]);
  if (!url) return <div className="h-40 bg-muted skeleton" />;
  return <img src={url} alt="Comprovante" className="w-full max-h-56 object-contain bg-muted" />;
}
