import type { ReactNode } from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

interface Props {
  title: string;
  variant?: "default" | "back";
  right?: ReactNode;
}

export function AppTopBar({ title, variant = "default", right }: Props) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 bg-topbar text-topbar-foreground safe-pt">
      <div className="flex items-center gap-2 px-4 h-14">
        <button
          onClick={() => (variant === "back" ? router.history.back() : null)}
          className="size-10 -ml-2 grid place-items-center rounded-full ripple active:bg-white/10"
          aria-label={variant === "back" ? "Voltar" : "Menu"}
        >
          {variant === "back" ? <ArrowLeft className="size-5" /> : <Menu className="size-5" />}
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight flex-1 truncate">{title}</h1>
        {right}
      </div>
    </header>
  );
}
