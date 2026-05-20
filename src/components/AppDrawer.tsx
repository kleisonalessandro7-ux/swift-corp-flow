import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AppDrawer({ open, onClose, title, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
      />
      <div className="relative w-full max-w-[480px] bg-background rounded-t-3xl shadow-elevated max-h-[92dvh] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-[16px] font-semibold tracking-tight">{title}</h2>
          <button onClick={onClose} className="size-9 grid place-items-center rounded-full text-muted-foreground active:bg-muted">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">{children}</div>
        {footer && <div className="p-4 border-t border-border bg-surface/50">{footer}</div>}
      </div>
    </div>
  );
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full h-11 px-3.5 rounded-2xl bg-input border border-border text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all";
