export type OSStatus = "aberta" | "em_andamento" | "encerrada" | "cancelada";

export interface OS {
  id: string;
  numero: string;
  cliente: string;
  cidade: string;
  inicio: string;
  fimPrevisto: string;
  status: OSStatus;
  horas: string;
  despesas: number;
  adiantamento: number;
  atualizadoHa: string;
}

export const osList: OS[] = [
  { id: "1", numero: "OS 2025-015", cliente: "Empresa ABC Ltda", cidade: "São Paulo / SP", inicio: "2025-05-20", fimPrevisto: "2025-05-28", status: "em_andamento", horas: "32h 30m", despesas: 1250.45, adiantamento: 800, atualizadoHa: "há 2h" },
  { id: "2", numero: "OS 2025-014", cliente: "Indústria XYZ S.A.", cidade: "Campinas / SP", inicio: "2025-05-18", fimPrevisto: "2025-05-25", status: "aberta", horas: "16h 00m", despesas: 620, adiantamento: 500, atualizadoHa: "há 1 dia" },
  { id: "3", numero: "OS 2025-013", cliente: "Comercial Delta Ltda", cidade: "Ribeirão Preto / SP", inicio: "2025-05-05", fimPrevisto: "2025-05-15", status: "encerrada", horas: "40h 00m", despesas: 2150, adiantamento: 1500, atualizadoHa: "há 5 dias" },
  { id: "4", numero: "OS 2025-012", cliente: "Tech Solutions Ltda", cidade: "Sorocaba / SP", inicio: "2025-05-01", fimPrevisto: "2025-05-10", status: "cancelada", horas: "—", despesas: 0, adiantamento: 0, atualizadoHa: "há 10 dias" },
];

export type CategoriaDespesa = "combustivel" | "almoco" | "jantar" | "pedagio" | "hospedagem" | "outras";

export interface Despesa {
  id: string;
  descricao: string;
  os: string;
  categoria: CategoriaDespesa;
  valor: number;
  data: string;
  status: "aprovado" | "rascunho" | "enviado";
}

export const despesas: Despesa[] = [
  { id: "d1", descricao: "Almoço - Restaurante Bom Sabor", os: "OS 2025-015", categoria: "almoco", valor: 45, data: "2025-05-26", status: "aprovado" },
  { id: "d2", descricao: "Combustível - Posto Ipiranga", os: "OS 2025-015", categoria: "combustivel", valor: 230, data: "2025-05-25", status: "rascunho" },
  { id: "d3", descricao: "Pedágio - Rod. Anhanguera", os: "OS 2025-014", categoria: "pedagio", valor: 12.4, data: "2025-05-25", status: "enviado" },
  { id: "d4", descricao: "Diária Hotel - Ibis Campinas", os: "OS 2025-013", categoria: "hospedagem", valor: 350, data: "2025-05-24", status: "aprovado" },
  { id: "d5", descricao: "Jantar - Churrascaria Grill", os: "OS 2025-013", categoria: "jantar", valor: 120, data: "2025-05-24", status: "aprovado" },
  { id: "d6", descricao: "Lavagem - Auto Clean", os: "OS 2025-014", categoria: "outras", valor: 35, data: "2025-05-23", status: "aprovado" },
];

export interface Hora {
  id: string;
  os: string;
  data: string;
  inicio: string;
  fim: string;
  intervalo: string;
  total: string;
  tipo: "Normal" | "Hora Extra" | "Deslocamento";
  obs: string;
}

export const horas: Hora[] = [
  { id: "h1", os: "OS 2025-015", data: "2025-05-26", inicio: "08:00", fim: "17:00", intervalo: "60 min", total: "8h 00m", tipo: "Normal", obs: "Instalação de equipamentos e testes" },
  { id: "h2", os: "OS 2025-015", data: "2025-05-25", inicio: "08:30", fim: "18:00", intervalo: "60 min", total: "9h 30m", tipo: "Hora Extra", obs: "Manutenção preventiva e corretiva" },
  { id: "h3", os: "OS 2025-014", data: "2025-05-24", inicio: "07:30", fim: "16:30", intervalo: "60 min", total: "8h 00m", tipo: "Normal", obs: "Visita técnica e diagnóstico" },
  { id: "h4", os: "OS 2025-013", data: "2025-05-23", inicio: "08:00", fim: "12:00", intervalo: "0 min", total: "4h 00m", tipo: "Deslocamento", obs: "Deslocamento para cliente" },
];

export interface Adiantamento {
  id: string;
  os: string;
  cliente: string;
  periodo: string;
  solicitado: number;
  recebido: number;
  saldo: number;
  status: "Pendente recebimento" | "Recebido" | "Aprovado";
  data: string;
}

export const adiantamentos: Adiantamento[] = [
  { id: "a1", os: "OS 2025-015", cliente: "Empresa ABC Ltda", periodo: "20/05 a 28/05/2025", solicitado: 1200, recebido: 0, saldo: 1200, status: "Pendente recebimento", data: "2025-05-20" },
  { id: "a2", os: "OS 2025-014", cliente: "Indústria XYZ S.A.", periodo: "18/05 a 25/05/2025", solicitado: 800, recebido: 800, saldo: 800, status: "Recebido", data: "2025-05-18" },
  { id: "a3", os: "OS 2025-013", cliente: "Comercial Delta Ltda", periodo: "05/05 a 15/05/2025", solicitado: 1500, recebido: 1500, saldo: 1500, status: "Recebido", data: "2025-05-05" },
];

export const valeRefeicao = {
  mes: "Maio/2025",
  saldoInicial: 1200,
  utilizado: 680,
  saldoRestante: 520,
  valorDiario: 45,
  projecaoFim: "12/06/2025",
  percentUsado: 57,
  historico: [
    { data: "26/05/2025", valor: 45 },
    { data: "25/05/2025", valor: 40 },
    { data: "24/05/2025", valor: 45 },
    { data: "23/05/2025", valor: 45 },
    { data: "22/05/2025", valor: 35 },
    { data: "21/05/2025", valor: 40 },
    { data: "20/05/2025", valor: 45 },
  ],
};

export const dashboardStats = {
  totalMes: 3650.45,
  totalMesVar: 8.5,
  horasMes: "128h 30m",
  horasMesVar: 12.3,
  adiantamentosPendentes: 1200,
  adiantamentosCount: 2,
  saldoReceber: 2450.45,
  valeUsado: 680,
  valeRestante: 520,
  valePercent: 43,
  categorias: [
    { label: "Combustível", value: 38, color: "var(--chart-1)" },
    { label: "Almoço", value: 22, color: "var(--chart-2)" },
    { label: "Hospedagem", value: 18, color: "var(--chart-3)" },
    { label: "Pedágio", value: 10, color: "var(--chart-4)" },
    { label: "Jantar", value: 7, color: "var(--chart-5)" },
    { label: "Outros", value: 5, color: "var(--muted-foreground)" },
  ],
};

export const relatoriosGerados = [
  { id: "r1", titulo: "OS 2025-014 - 18/05 a 25/05/2025", quando: "26/05/2025 09:15" },
  { id: "r2", titulo: "OS 2025-013 - 05/05 a 15/05/2025", quando: "16/05/2025 14:30" },
  { id: "r3", titulo: "Relatório Mensal - Maio/2025", quando: "01/06/2025 10:00" },
];
