import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getValidatedUser } from "./auth-session";

const user = { id: "account-id" };
const expired = { name: "AuthApiError", code: "bad_jwt", message: "token is expired" };
function mockClient(session: unknown = { user }) {
  const auth = {
    getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    refreshSession: vi.fn().mockResolvedValue({ data: { session: { user } }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };
  return { auth, client: { auth } as unknown as SupabaseClient };
}

describe("session recovery", () => {
  it("returns signed out without requesting a user when no session exists", async () => {
    const { client, auth } = mockClient(null);
    expect(await getValidatedUser(client)).toBeNull();
    expect(auth.getUser).not.toHaveBeenCalled();
  });

  it("validates an active session without refreshing it", async () => {
    const { client, auth } = mockClient();
    expect(await getValidatedUser(client)).toEqual(user);
    expect(auth.refreshSession).not.toHaveBeenCalled();
  });

  it("refreshes an expired JWT and validates the renewed user", async () => {
    const { client, auth } = mockClient();
    auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: expired });
    expect(await getValidatedUser(client)).toEqual(user);
    expect(auth.refreshSession).toHaveBeenCalledTimes(1);
    expect(auth.getUser).toHaveBeenCalledTimes(2);
  });

  it("clears only local credentials when refresh credentials are invalid", async () => {
    const { client, auth } = mockClient();
    auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: expired });
    auth.refreshSession.mockResolvedValue({ data: { session: null }, error: { code: "refresh_token_not_found" } });
    expect(await getValidatedUser(client)).toBeNull();
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("handles a session disappearing during validation without a route error", async () => {
    const { client, auth } = mockClient();
    auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: { name: "AuthSessionMissingError" } });
    auth.refreshSession.mockResolvedValue({ data: { session: null }, error: null });
    expect(await getValidatedUser(client)).toBeNull();
  });

  it("does not mistake a network outage for an invalid session", async () => {
    const { client, auth } = mockClient();
    const offline = { name: "AuthRetryableFetchError", message: "Failed to fetch" };
    auth.getUser.mockResolvedValue({ data: { user: null }, error: offline });
    await expect(getValidatedUser(client)).rejects.toEqual(offline);
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it("limits retries when the refreshed token is also rejected", async () => {
    const { client, auth } = mockClient();
    auth.getUser.mockResolvedValue({ data: { user: null }, error: expired });
    expect(await getValidatedUser(client)).toBeNull();
    expect(auth.refreshSession).toHaveBeenCalledTimes(1);
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});