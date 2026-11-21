import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/integrations/supabase/types";
import { requireActiveAdmin } from "./admin-access";

function mockClient(role: unknown, valid: boolean) {
  const filter = { eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: role, error: null }) };
  const rpc = vi.fn().mockResolvedValue({ data: valid, error: null });
  return { rpc, client: { from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(filter) }), rpc } as unknown as SupabaseClient<Database> };
}
describe("administrative authorization", () => {
  it("rejects an ordinary signed-in account", async () => {
    const { client, rpc } = mockClient(null, true);
    await expect(requireActiveAdmin(client, "ordinary-account")).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("rejects an administrator whose access has expired", async () => {
    const { client } = mockClient({ role: "admin" }, false);
    await expect(requireActiveAdmin(client, "expired-admin")).rejects.toThrow();
  });
  it("permits only an administrator with valid access", async () => {
    const { client, rpc } = mockClient({ role: "admin" }, true);
    await expect(requireActiveAdmin(client, "active-admin")).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledWith("has_valid_access", { check_user_id: "active-admin" });
  });
  it("fails closed when validity cannot be checked", async () => {
    const { client, rpc } = mockClient({ role: "admin" }, true);
    rpc.mockResolvedValue({ data: null, error: new Error("network") });
    await expect(requireActiveAdmin(client, "active-admin")).rejects.toThrow();
  });
});