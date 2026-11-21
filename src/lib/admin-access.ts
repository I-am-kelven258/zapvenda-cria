import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function requireActiveAdmin(client: SupabaseClient<Database>, userId: string) {
  const { data: role, error: roleError } = await client.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (roleError) throw new Error("Não foi possível verificar a autorização.");
  if (!role) throw new Error("Não tens autorização para gerir utilizadores.");
  const { data: allowed, error } = await client.rpc("has_valid_access", { check_user_id: userId });
  if (error) throw new Error("Não foi possível verificar a validade do acesso.");
  if (!allowed) throw new Error("O teu acesso terminou. Contacta o administrador.");
}