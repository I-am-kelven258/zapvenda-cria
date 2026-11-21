import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { signInWithEmail, loginErrorMessage } from "./auth-login";

function clientMock() {
  const user = { id: "existing-account" };
  const auth = {
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: { user } }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: { user } }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
  };
  return { auth, client: { auth } as unknown as SupabaseClient };
}
describe("email login", () => {
  it("normalizes email without changing the password and validates the returned session", async () => {
    const { auth, client } = clientMock();
    expect(await signInWithEmail(client, " Owner@Example.com ", "  unchanged  ")).toEqual({ id: "existing-account" });
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "owner@example.com", password: "  unchanged  " });
    expect(auth.getUser).toHaveBeenCalledOnce();
  });
  it("does not consider a missing session a successful login", async () => {
    const { auth, client } = clientMock();
    auth.signInWithPassword.mockResolvedValue({ data: { session: null }, error: null });
    await expect(signInWithEmail(client, "owner@example.com", "unchanged")).rejects.toThrow();
    expect(auth.getUser).not.toHaveBeenCalled();
  });
  it("propagates network failure without proceeding to user validation", async () => {
    const { auth, client } = clientMock();
    const error = new TypeError("Load failed");
    auth.signInWithPassword.mockResolvedValue({ data: { session: null }, error });
    await expect(signInWithEmail(client, "owner@example.com", "unchanged")).rejects.toBe(error);
    expect(auth.getUser).not.toHaveBeenCalled();
  });
  it("does not expose unknown provider error details", () => {
    expect(loginErrorMessage(new Error("private-provider-detail"))).not.toContain("private-provider-detail");
  });
});