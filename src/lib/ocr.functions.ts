import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  imageBase64: z.string().min(20).max(15_000_000),
});

export interface OCRResult {
  descricao?: string;
  estabelecimento?: string;
  valor?: number;
  data?: string;
  categoria?: "combustivel" | "almoco" | "jantar" | "pedagio" | "hospedagem" | "outras";
}

export const ocrComprovante = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<OCRResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente no servidor");

    const sys = `Você é um assistente que extrai dados de comprovantes/recibos brasileiros. Responda SEMPRE em JSON com as chaves: descricao (string curta), estabelecimento (string), valor (número em reais, sem R$), data (formato YYYY-MM-DD), categoria (um de: combustivel, almoco, jantar, pedagio, hospedagem, outras). Se não conseguir identificar um campo, omita-o.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          {
            role: "user",
            content: [
              { type: "text", text: "Extraia os dados deste comprovante." },
              { type: "image_url", image_url: { url: data.imageBase64 } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Limite de uso atingido. Tente novamente em alguns segundos.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados.");
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OCR falhou (${res.status}): ${txt.slice(0, 200)}`);
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content);
      const out: OCRResult = {};
      if (typeof parsed.descricao === "string") out.descricao = parsed.descricao;
      if (typeof parsed.estabelecimento === "string") out.estabelecimento = parsed.estabelecimento;
      if (typeof parsed.valor === "number") out.valor = parsed.valor;
      else if (typeof parsed.valor === "string") out.valor = parseFloat(parsed.valor.replace(",", "."));
      if (typeof parsed.data === "string") out.data = parsed.data;
      if (typeof parsed.categoria === "string") {
        const cat = parsed.categoria.toLowerCase();
        const valid = ["combustivel", "almoco", "jantar", "pedagio", "hospedagem", "outras"];
        if (valid.includes(cat)) out.categoria = cat as OCRResult["categoria"];
      }
      return out;
    } catch {
      return {};
    }
  });
