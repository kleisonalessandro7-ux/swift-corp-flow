import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppBottomNav } from "@/components/AppBottomNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="app-shell pb-28">
      <Outlet />
      <AppBottomNav />
    </div>
  );
}
