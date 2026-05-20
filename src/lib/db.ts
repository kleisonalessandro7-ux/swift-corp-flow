import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type OSRow = Tables["ordens_servico"]["Row"];
export type OSInsert = Tables["ordens_servico"]["Insert"];
export type DespesaRow = Tables["despesas"]["Row"];
export type DespesaInsert = Tables["despesas"]["Insert"];
export type HoraRow = Tables["horas_trabalhadas"]["Row"];
export type HoraInsert = Tables["horas_trabalhadas"]["Insert"];
export type AdiantamentoRow = Tables["adiantamentos"]["Row"];
export type AdiantamentoInsert = Tables["adiantamentos"]["Insert"];
export type VRConfigRow = Tables["vale_refeicao_config"]["Row"];
export type VRUsoRow = Tables["vale_refeicao_uso"]["Row"];
export type RelatorioRow = Tables["relatorios_gerados"]["Row"];
export type ProfileRow = Tables["profiles"]["Row"];

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Não autenticado");
  return data.user.id;
}

function err(e: unknown) {
  const msg = e instanceof Error ? e.message : "Erro desconhecido";
  toast.error(msg);
  throw e;
}

// ============ PROFILE ============
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const uid = await getUserId();
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<ProfileRow>) => {
      const uid = await getUserId();
      const { error } = await supabase.from("profiles").update(patch).eq("user_id", uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
    onError: err,
  });
}

// ============ ORDENS DE SERVIÇO ============
export function useOSList() {
  return useQuery({
    queryKey: ["os"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useOSById(id: string | null) {
  return useQuery({
    queryKey: ["os", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("ordens_servico").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<OSInsert, "user_id"> & { id?: string }) => {
      const uid = await getUserId();
      const payload = { ...input, user_id: uid };
      const { data, error } = await supabase.from("ordens_servico").upsert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["os"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("OS salva com sucesso");
    },
    onError: err,
  });
}

export function useDeleteOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ordens_servico").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["os"] });
      toast.success("OS removida");
    },
    onError: err,
  });
}

// ============ DESPESAS ============
export function useDespesas() {
  return useQuery({
    queryKey: ["despesas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("despesas")
        .select("*, ordens_servico(numero, cliente)")
        .order("data", { ascending: false });
      if (error) throw error;
      return data as (DespesaRow & { ordens_servico: { numero: string; cliente: string } | null })[];
    },
  });
}

export function useUpsertDespesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<DespesaInsert, "user_id"> & { id?: string }) => {
      const uid = await getUserId();
      const { data, error } = await supabase
        .from("despesas")
        .upsert({ ...input, user_id: uid })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["despesas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Despesa salva");
    },
    onError: err,
  });
}

export function useDeleteDespesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("despesas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["despesas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Despesa removida");
    },
    onError: err,
  });
}

// ============ HORAS ============
export function useHoras() {
  return useQuery({
    queryKey: ["horas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horas_trabalhadas")
        .select("*, ordens_servico(numero, cliente)")
        .order("data", { ascending: false });
      if (error) throw error;
      return data as (HoraRow & { ordens_servico: { numero: string; cliente: string } | null })[];
    },
  });
}

export function useUpsertHora() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<HoraInsert, "user_id"> & { id?: string }) => {
      const uid = await getUserId();
      const { data, error } = await supabase.from("horas_trabalhadas").upsert({ ...input, user_id: uid }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Registro salvo");
    },
    onError: err,
  });
}

export function useDeleteHora() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("horas_trabalhadas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horas"] });
      toast.success("Registro removido");
    },
    onError: err,
  });
}

// ============ ADIANTAMENTOS ============
export function useAdiantamentos() {
  return useQuery({
    queryKey: ["adiantamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("adiantamentos")
        .select("*, ordens_servico(numero, cliente)")
        .order("data", { ascending: false });
      if (error) throw error;
      return data as (AdiantamentoRow & { ordens_servico: { numero: string; cliente: string } | null })[];
    },
  });
}

export function useUpsertAdiantamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<AdiantamentoInsert, "user_id"> & { id?: string }) => {
      const uid = await getUserId();
      const { data, error } = await supabase.from("adiantamentos").upsert({ ...input, user_id: uid }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adiantamentos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Adiantamento salvo");
    },
    onError: err,
  });
}

export function useDeleteAdiantamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("adiantamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adiantamentos"] });
      toast.success("Removido");
    },
    onError: err,
  });
}

// ============ VALE REFEIÇÃO ============
function currentMonthRef(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function useVRConfig() {
  return useQuery({
    queryKey: ["vr-config"],
    queryFn: async () => {
      const uid = await getUserId();
      const mes = currentMonthRef();
      let { data, error } = await supabase
        .from("vale_refeicao_config")
        .select("*")
        .eq("user_id", uid)
        .eq("mes_ref", mes)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        const res = await supabase
          .from("vale_refeicao_config")
          .insert({ user_id: uid, mes_ref: mes, valor_diario: 45, saldo_mensal: 1200 })
          .select()
          .single();
        if (res.error) throw res.error;
        data = res.data;
      }
      return data!;
    },
  });
}

export function useUpdateVRConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: { valor_diario?: number; saldo_mensal?: number }) => {
      const uid = await getUserId();
      const mes = currentMonthRef();
      const { error } = await supabase
        .from("vale_refeicao_config")
        .update(patch)
        .eq("user_id", uid)
        .eq("mes_ref", mes);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vr-config"] });
      toast.success("Saldo atualizado");
    },
    onError: err,
  });
}

export function useVRUso() {
  return useQuery({
    queryKey: ["vr-uso"],
    queryFn: async () => {
      const d = new Date();
      const ini = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      const { data, error } = await supabase
        .from("vale_refeicao_uso")
        .select("*")
        .gte("data", ini)
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddVRUso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { valor: number; data?: string; descricao?: string }) => {
      const uid = await getUserId();
      const { error } = await supabase.from("vale_refeicao_uso").insert({ user_id: uid, ...input });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vr-uso"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Uso registrado");
    },
    onError: err,
  });
}

export function useDeleteVRUso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vale_refeicao_uso").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vr-uso"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: err,
  });
}

// ============ RELATÓRIOS ============
export function useRelatorios() {
  return useQuery({
    queryKey: ["relatorios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relatorios_gerados")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

export function useAddRelatorio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { titulo: string; tipo: string; os_id?: string | null; periodo_inicio?: string; periodo_fim?: string }) => {
      const uid = await getUserId();
      const { error } = await supabase.from("relatorios_gerados").insert({ user_id: uid, ...input });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["relatorios"] }),
    onError: err,
  });
}

// ============ DASHBOARD AGGREGATE ============
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const d = new Date();
      const ini = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      const [despesasRes, horasRes, adRes, vrUsoRes, vrCfgRes] = await Promise.all([
        supabase.from("despesas").select("valor, categoria, data").gte("data", ini),
        supabase.from("horas_trabalhadas").select("inicio, fim, intervalo_min").gte("data", ini),
        supabase.from("adiantamentos").select("solicitado, recebido, status"),
        supabase.from("vale_refeicao_uso").select("valor").gte("data", ini),
        supabase.from("vale_refeicao_config").select("saldo_mensal").eq("mes_ref", ini).maybeSingle(),
      ]);

      const despesas = despesasRes.data ?? [];
      const horas = horasRes.data ?? [];
      const ads = adRes.data ?? [];
      const vrUsos = vrUsoRes.data ?? [];

      const totalMes = despesas.reduce((a, b) => a + Number(b.valor), 0);

      const minPorRegistro = horas.map((h) => {
        const [h1, m1] = h.inicio.split(":").map(Number);
        const [h2, m2] = h.fim.split(":").map(Number);
        return Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1) - (h.intervalo_min ?? 0));
      });
      const totalMin = minPorRegistro.reduce((a, b) => a + b, 0);

      const adPendentes = ads.filter((a) => a.status === "pendente" || a.status === "aprovado");
      const adiantamentosPendentes = adPendentes.reduce((a, b) => a + Number(b.solicitado) - Number(b.recebido), 0);

      const valeUsado = vrUsos.reduce((a, b) => a + Number(b.valor), 0);
      const valeSaldoTotal = Number(vrCfgRes.data?.saldo_mensal ?? 1200);
      const valeRestante = Math.max(0, valeSaldoTotal - valeUsado);
      const valePercent = valeSaldoTotal > 0 ? Math.round((valeUsado / valeSaldoTotal) * 100) : 0;

      const catMap: Record<string, number> = {};
      despesas.forEach((d) => {
        catMap[d.categoria] = (catMap[d.categoria] ?? 0) + Number(d.valor);
      });
      const catLabels: Record<string, string> = {
        combustivel: "Combustível",
        almoco: "Almoço",
        jantar: "Jantar",
        pedagio: "Pedágio",
        hospedagem: "Hospedagem",
        outras: "Outras",
      };
      const catColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];
      const categorias = Object.entries(catMap)
        .map(([k, v], i) => ({
          label: catLabels[k] ?? k,
          value: totalMes > 0 ? Math.round((v / totalMes) * 100) : 0,
          color: catColors[i % catColors.length],
        }))
        .sort((a, b) => b.value - a.value);

      return {
        totalMes,
        horasMes: `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`,
        adiantamentosPendentes,
        adiantamentosCount: adPendentes.length,
        saldoReceber: ads.reduce((a, b) => a + Number(b.solicitado) - Number(b.recebido), 0),
        valeUsado,
        valeRestante,
        valePercent,
        categorias,
      };
    },
  });
}
