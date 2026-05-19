import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, ClipboardList, Receipt, Clock, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tab {
  to: string;
  label: string;
  Icon: LucideIcon;
}

const tabs: Tab[] = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/os", label: "OS", Icon: ClipboardList },
  { to: "/despesas", label: "Despesas", Icon: Receipt },
  { to: "/horas", label: "Horas", Icon: Clock },
  { to: "/configuracoes", label: "Config", Icon: Settings },
];

export function AppBottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[456px]"
      aria-label="Navegação principal"
    >
      <div className="bg-surface/95 backdrop-blur-lg border border-border rounded-full shadow-elevated px-2 py-1.5 flex items-center justify-between">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full transition-all duration-200 ripple"
              aria-current={active ? "page" : undefined}
            >
              <span
                className={[
                  "grid place-items-center transition-all duration-300",
                  active
                    ? "bg-primary-container text-primary-container-foreground h-7 w-12 rounded-full"
                    : "text-muted-foreground h-7 w-12",
                ].join(" ")}
              >
                <Icon className="size-[18px]" strokeWidth={active ? 2.4 : 2} />
              </span>
              <span
                className={[
                  "text-[10.5px] leading-none font-medium tracking-tight transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
