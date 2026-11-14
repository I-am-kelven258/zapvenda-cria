import type { SupabaseClient } from "@supabase/supabase-js";

export function isInvalidSession(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { name, code, message } = error as { name?: string; code?: string; message?: string };
  return name === "AuthSessionMissingError"
    || ["bad_jwt", "session_not_found", "refresh_token_not_found", "refresh_token_already_used"].includes(code ?? "")
    || /token.*expired|invalid.*jwt|session missing|invalid refresh token/i.test(message ?? "");
}

// Browser-only callers: hydrate/refresh storage before validating with Auth.
// Missing or irrecoverable credentials are a signed-out state, not a route error.
export async function getValidatedUser(client: SupabaseClient) {
  async function clearSession() {
    await client.auth.signOut({ scope: "local" });
    return null;
  }

  const { data: stored, error: storageError } = await client.auth.getSession();
  if (storageError) {
    if (isInvalidSession(storageError)) return clearSession();
    throw storageError;
  }
  if (!stored.session) return null;

  const { data, error } = await client.auth.getUser();
  if (!error) return data.user;
  if (!isInvalidSession(error)) throw error;

  // A brokered preview or a resumed tab may still hold an expired access token.
  const { data: renewed, error: refreshError } = await client.auth.refreshSession();
  if (refreshError) {
    if (isInvalidSession(refreshError)) return clearSession();
    throw refreshError;
  }
  if (!renewed.session) return clearSession();

  const { data: verified, error: verificationError } = await client.auth.getUser();
  if (verificationError) {
    if (isInvalidSession(verificationError)) return clearSession();
    throw verificationError;
  }
  return verified.user;
}