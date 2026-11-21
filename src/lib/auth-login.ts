import type { SupabaseClient } from "@supabase/supabase-js";
import { getValidatedUser } from "./auth-session";

export function loginErrorMessage(error: unknown): string {
  const message = error && typeof error === "object" && "message" in error ? String(error.message).toLowerCase() : "";
  if (/invalid login credentials/.test(message)) return "E-mail ou palavra-passe incorretos. Verifica os teus dados e tenta novamente.";
  if (/email not confirmed/.test(message)) return "Esta conta ainda não foi confirmada. Contacta o administrador.";
  if (/too many requests|rate.limit/.test(message)) return "Foram feitas demasiadas tentativas. Aguarda um pouco e tenta novamente.";
  if (/fetch|network|load failed|timeout/.test(message)) return "Não foi possível ligar ao serviço de acesso. Verifica a ligação à internet e tenta novamente.";
  return "Não foi possível entrar na tua conta. Tenta novamente ou contacta o suporte.";
}

export async function signInWithEmail(client: SupabaseClient, email: string, password: string) {
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw error;
  if (!data.session) throw new Error("Sessão não recebida.");
  const user = await getValidatedUser(client);
  if (!user) throw new Error("Sessão inválida.");
  return user;
}