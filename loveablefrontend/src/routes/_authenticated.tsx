import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { currentUserQuery } from "@/lib/operator360/queries";
import { AppShell } from "@/components/operator360/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location, context }) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    let user;
    try {
      user = await context.queryClient.ensureQueryData(currentUserQuery);
    } catch {
      user = null;
    }
    
    // RBAC: Enforce role-based routing
    if (user && user.role) {
      const path = location.pathname;
      const role = user.role;
      
      const roleHome: Record<string, string> = {
        ADMIN: '/admin/dashboard',
        CUSTOMER: '/customer/dashboard',
        OPERATOR: '/operator/dashboard',
        INSURANCE: '/insurance/dashboard'
      };
      const rolePrefix: Record<string, string> = {
        ADMIN: '/admin',
        CUSTOMER: '/customer',
        OPERATOR: '/operator',
        INSURANCE: '/insurance'
      };
      
      const allowedPrefix = rolePrefix[role];
      if (allowedPrefix && !path.startsWith(allowedPrefix)) {
        const home = roleHome[role] ?? '/auth';
        throw redirect({ to: home as "/admin/dashboard" | "/customer/dashboard" | "/operator/dashboard" | "/insurance/dashboard" });
      }
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { data: user } = useSuspenseQuery(currentUserQuery);
  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center text-sm text-muted-foreground">
        <div>
          <p className="font-semibold text-base text-foreground mb-2">Profile not found</p>
          <p>Your account exists but has no profile record yet. Please contact your administrator, or <a href="/auth" className="text-primary underline">sign in again</a>.</p>
        </div>
      </div>
    );
  }
  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  );
}