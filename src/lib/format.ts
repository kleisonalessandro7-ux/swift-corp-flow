export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
};

export const fmtDateLong = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
};

export const initials = (name?: string | null) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
};

export const greeting = (name?: string | null) => {
  const h = new Date().getHours();
  const part = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const first = name?.split(" ")[0] ?? "";
  return first ? `${part}, ${first}` : part;
};
