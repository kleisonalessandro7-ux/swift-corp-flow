import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "destructive" | "neutral" | "primary";

const tones: Record<Tone, string> = {
  info: "bg-info/12 text-info border-info/20",
  success: "bg-success/12 text-success border-success/20",
  warning: "bg-warning/15 text-[oklch(0.5_0.15_70)] border-warning/30",
  destructive: "bg-destructive/12 text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary-container text-primary-container-foreground border-transparent",
};

export function AppStatusChip({
  tone = "neutral",
  children,
  size = "sm",
}: {
  tone?: Tone;
  children: ReactNode;
  size?: "sm" | "xs";
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border font-medium tracking-tight whitespace-nowrap",
        size === "xs" ? "text-[10.5px] px-2 py-0.5" : "text-[11.5px] px-2.5 py-1",
        tones[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
