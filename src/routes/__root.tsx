import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="app-shell flex flex-col items-center justify-center text-center px-6">
      <div className="text-7xl font-bold text-primary">404</div>
      <p className="mt-3 text-foreground font-semibold">Página não encontrada</p>
      <p className="text-sm text-muted-foreground mt-1">Verifique o endereço ou volte ao início.</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-fab"
      >
        Ir para o início
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="app-shell flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-lg font-semibold text-foreground">Algo deu errado</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={() => { router.invalidate(); reset(); }}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-fab"
      >
        Tentar de novo
      </button>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1A3A8C" },
      { title: "ViagemCorpApp — Gestão de despesas corporativas" },
      { name: "description", content: "Gerencie ordens de serviço, despesas, horas, adiantamentos e vale-refeição corporativos." },
      { property: "og:title", content: "ViagemCorpApp — Gestão de despesas corporativas" },
      { name: "twitter:title", content: "ViagemCorpApp — Gestão de despesas corporativas" },
      { property: "og:description", content: "Gerencie ordens de serviço, despesas, horas, adiantamentos e vale-refeição corporativos." },
      { name: "twitter:description", content: "Gerencie ordens de serviço, despesas, horas, adiantamentos e vale-refeição corporativos." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d33a041e-566e-46c9-88b1-6a62af3cd057/id-preview-cb7f02d4--0701c22f-f5d3-441c-95b9-b56e1691cb98.lovable.app-1779209018907.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d33a041e-566e-46c9-88b1-6a62af3cd057/id-preview-cb7f02d4--0701c22f-f5d3-441c-95b9-b56e1691cb98.lovable.app-1779209018907.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Outlet />
          <Toaster
            position="top-center"
            toastOptions={{
              className: "!bg-surface !text-foreground !border-border !rounded-2xl !shadow-elevated",
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
