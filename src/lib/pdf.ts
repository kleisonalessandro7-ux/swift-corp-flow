import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { brl } from "@/lib/format";
import type { DespesaRow, HoraRow, AdiantamentoRow, OSRow } from "@/lib/db";

interface Input {
  titulo: string;
  periodoInicio?: string;
  periodoFim?: string;
  os?: OSRow | null;
  despesas: (DespesaRow & { ordens_servico?: { numero: string } | null })[];
  horas: (HoraRow & { ordens_servico?: { numero: string } | null })[];
  adiantamentos: AdiantamentoRow[];
  usuario?: string;
}

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function totalMin(h: HoraRow) {
  const [h1, m1] = h.inicio.split(":").map(Number);
  const [h2, m2] = h.fim.split(":").map(Number);
  return Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1) - (h.intervalo_min ?? 0));
}

export function gerarRelatorioPDF(input: Input): { blob: Blob; filename: string } {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;

  // Cabeçalho
  doc.setFillColor(26, 58, 140);
  doc.rect(0, 0, W, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ViagemCorp", M, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(input.titulo, M, 56);

  doc.setTextColor(80, 80, 80);
  let y = 110;
  doc.setFontSize(10);
  if (input.periodoInicio || input.periodoFim) {
    doc.text(`Período: ${fmt(input.periodoInicio)} a ${fmt(input.periodoFim)}`, M, y);
    y += 14;
  }
  if (input.usuario) {
    doc.text(`Funcionário: ${input.usuario}`, M, y);
    y += 14;
  }
  doc.text(`Emitido em: ${new Date().toLocaleString("pt-BR")}`, M, y);
  y += 20;

  // Resumo
  const totDesp = input.despesas.reduce((a, b) => a + Number(b.valor), 0);
  const totMin = input.horas.reduce((a, b) => a + totalMin(b), 0);
  const totSolic = input.adiantamentos.reduce((a, b) => a + Number(b.solicitado), 0);
  const totReceb = input.adiantamentos.reduce((a, b) => a + Number(b.recebido), 0);

  doc.setFillColor(245, 247, 252);
  doc.roundedRect(M, y, W - M * 2, 70, 8, 8, "F");
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Resumo", M + 12, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Despesas: ${brl(totDesp)}`, M + 12, y + 38);
  doc.text(`Horas: ${Math.floor(totMin / 60)}h ${totMin % 60}m`, M + 160, y + 38);
  doc.text(`Solicitado: ${brl(totSolic)}`, M + 12, y + 56);
  doc.text(`Recebido: ${brl(totReceb)}`, M + 160, y + 56);
  doc.text(`Saldo: ${brl(totDesp - totReceb)}`, M + 310, y + 56);
  y += 90;

  // Despesas
  if (input.despesas.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Data", "Descrição", "OS", "Categoria", "Valor"]],
      body: input.despesas.map((d) => [
        fmt(d.data),
        d.descricao,
        d.ordens_servico?.numero ?? "—",
        d.categoria,
        brl(Number(d.valor)),
      ]),
      headStyles: { fillColor: [26, 58, 140], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: M, right: M },
      didDrawPage: () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(26, 58, 140);
        doc.text("Despesas", M, (doc as unknown as { lastAutoTable: { startY: number } }).lastAutoTable?.startY ? y - 6 : y - 6);
      },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  }

  // Horas
  if (input.horas.length > 0) {
    if (y > 700) { doc.addPage(); y = M; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 58, 140);
    doc.text("Horas trabalhadas", M, y);
    autoTable(doc, {
      startY: y + 6,
      head: [["Data", "OS", "Início", "Fim", "Interv.", "Tipo", "Total"]],
      body: input.horas.map((h) => {
        const tm = totalMin(h);
        return [
          fmt(h.data),
          h.ordens_servico?.numero ?? "—",
          h.inicio.slice(0, 5),
          h.fim.slice(0, 5),
          `${h.intervalo_min}min`,
          h.tipo,
          `${Math.floor(tm / 60)}h ${tm % 60}m`,
        ];
      }),
      headStyles: { fillColor: [26, 58, 140], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: M, right: M },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  }

  // Adiantamentos
  if (input.adiantamentos.length > 0) {
    if (y > 700) { doc.addPage(); y = M; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 58, 140);
    doc.text("Adiantamentos", M, y);
    autoTable(doc, {
      startY: y + 6,
      head: [["Data", "Cliente", "Período", "Solicitado", "Recebido", "Status"]],
      body: input.adiantamentos.map((a) => [
        fmt(a.data),
        a.cliente ?? "—",
        a.periodo ?? "—",
        brl(Number(a.solicitado)),
        brl(Number(a.recebido)),
        a.status,
      ]),
      headStyles: { fillColor: [26, 58, 140], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: M, right: M },
    });
  }

  // Rodapé com paginação
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`ViagemCorpApp · Página ${i} de ${total}`, W / 2, doc.internal.pageSize.getHeight() - 16, { align: "center" });
  }

  const blob = doc.output("blob");
  const filename = `${input.titulo.replace(/[^a-z0-9]+/gi, "_")}_${Date.now()}.pdf`;
  return { blob, filename };
}

export function baixarBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
