import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getValidatedUser } from "@/lib/auth-session";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      queryKey: ["auth", "user"],
      queryFn: () => getValidatedUser(supabase),
      staleTime: 0,
      retry: false,
    });
    if (!user) throw redirect({ to: "/auth" });

    const { data: access, error: accessError } = await supabase
      .from("user_access")
      .select("valid_until, revoked_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (accessError) throw accessError;

    const expired = !access || access.revoked_at !== null || (access.valid_until !== null && new Date(access.valid_until).getTime() <= Date.now());
    if (expired) {
      await supabase.auth.signOut({ scope: "local" });
      throw redirect({ href: "/auth?acesso=expirado" });
    }
    return { user };
  },
  component: () => <Outlet />,
});
