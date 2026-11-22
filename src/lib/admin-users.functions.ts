import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireActiveAdmin } from "./admin-access";

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  validityDays: number;
};

function validateInput(value: unknown): CreateUserInput {
  if (!value || typeof value !== "object") throw new Error("Dados inválidos.");
  const data = value as Record<string, unknown>;
  const name = String(data["name"] ?? "").trim();
  const email = String(data["email"] ?? "").trim().toLowerCase();
  const password = String(data["password"] ?? "");
  const validityDays = Number(data["validityDays"]);

  if (name.length < 2 || name.length > 100) throw new Error("Introduz um nome válido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error("Introduz um email válido.");
  if (password.length < 8 || password.length > 128) throw new Error("A senha deve ter entre 8 e 128 caracteres.");
  if (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 3650) throw new Error("A validade deve ser entre 1 e 3650 dias.");

  return { name, email, password, validityDays };
}

export const criarUtilizadorAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateInput)
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.supabase, context.userId);
    const { supabaseAdmin: adminClient } = await import("@/integrations/supabase/client.server");
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.name, name: data.name },
    });

    if (createError || !created.user) {
      if (createError?.message.toLowerCase().includes("already")) {
        throw new Error("Já existe uma conta com esse email.");
      }
      throw new Error("Não foi possível criar a conta. Verifica os dados e tenta novamente.");
    }

    const validUntil = new Date(Date.now() + data.validityDays * 24 * 60 * 60 * 1000).toISOString();
    const { error: accessError } = await adminClient
      .from("user_access")
      .insert({ user_id: created.user.id, valid_until: validUntil });

    if (accessError) {
      throw new Error("A conta foi criada, mas não foi ativada. O acesso continua bloqueado; contacta o suporte para guardar a validade.");
    }

    return { ok: true as const, email: data.email, validUntil };
  });


export const listarUtilizadoresAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireActiveAdmin(context.supabase, context.userId);
    const { supabaseAdmin: adminClient } = await import("@/integrations/supabase/client.server");

    const allUsers: Array<{
      id: string;
      email?: string;
      created_at: string;
      user_metadata: Record<string, unknown>;
    }> = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data: result, error } = await adminClient.auth.admin.listUsers({ page, perPage });
      if (error) throw new Error("Não foi possível carregar a lista de utilizadores.");
      allUsers.push(...result.users);
      if (result.users.length < perPage) break;
      page += 1;
    }

    const accessByUserId = new Map<string, { valid_until: string | null; revoked_at: string | null }>();
    const adminUserIds = new Set<string>();
    for (let offset = 0; offset < allUsers.length; offset += 200) {
      const batch = allUsers.slice(offset, offset + 200);
      const { data: accessRows, error } = await adminClient
        .from("user_access")
        .select("user_id, valid_until, revoked_at")
        .in("user_id", batch.map((user) => user.id));
      if (error) throw new Error("Não foi possível carregar a validade dos acessos.");
      for (const row of accessRows ?? []) {
        accessByUserId.set(row.user_id, { valid_until: row.valid_until, revoked_at: row.revoked_at });
      }
      const { data: roleRows, error: rolesError } = await adminClient
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", batch.map((user) => user.id));
      if (rolesError) throw new Error("Não foi possível carregar os perfis dos utilizadores.");
      for (const row of roleRows ?? []) {
        if (row.role === "admin") adminUserIds.add(row.user_id);
      }
    }

    return {
      total: allUsers.length,
      users: allUsers.map((user) => {
        const access = accessByUserId.get(user.id);
        const metadata = user.user_metadata ?? {};
        return {
          id: user.id,
          is_admin: adminUserIds.has(user.id),
          email: user.email ?? "",
          name: String(metadata["full_name"] ?? metadata["name"] ?? user.email?.split("@")[0] ?? "Utilizador"),
          created_at: user.created_at,
          valid_until: access?.valid_until ?? null,
          revoked_at: access?.revoked_at ?? null,
          access_record_missing: !access,
        };
      }).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    };
  });


type ToggleUserAccessInput = {
  userId: string;
  active: boolean;
};

function validateToggleUserAccess(value: unknown): ToggleUserAccessInput {
  if (!value || typeof value !== "object") throw new Error("Dados inválidos.");
  const data = value as Record<string, unknown>;
  const userId = String(data["userId"] ?? "");
  const active = data["active"];
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    throw new Error("Utilizador inválido.");
  }
  if (typeof active !== "boolean") throw new Error("Estado de acesso inválido.");
  return { userId, active };
}

export const alterarEstadoUtilizadorAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateToggleUserAccess)
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.supabase, context.userId);
    if (data.userId === context.userId) {
      throw new Error("Não podes desativar a tua própria conta.");
    }

    const { supabaseAdmin: adminClient } = await import("@/integrations/supabase/client.server");
    const { data: targetRole, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) throw new Error("Não foi possível verificar a conta selecionada.");
    if (targetRole) throw new Error("Por segurança, não é permitido alterar o acesso de outra conta administrativa.");

    const { data: access, error: accessError } = await adminClient
      .from("user_access")
      .select("user_id, valid_until, revoked_at")
      .eq("user_id", data.userId)
      .maybeSingle();

    if (accessError) throw new Error("Não foi possível consultar o acesso deste utilizador.");

    if (data.active) {
      if (!access) throw new Error("Esta conta não tem um registo de validade. Não é possível ativá-la automaticamente.");
      if (access.valid_until && new Date(access.valid_until).getTime() <= Date.now()) {
        throw new Error("A validade desta conta terminou. É necessário renovar o acesso antes de ativá-la.");
      }

      const { error: unbanError } = await adminClient.auth.admin.updateUserById(data.userId, {
        ban_duration: "none",
      });
      if (unbanError) throw new Error("Não foi possível reativar a conta no sistema de autenticação.");

      const { error: restoreError } = await adminClient
        .from("user_access")
        .update({ revoked_at: null })
        .eq("user_id", data.userId);

      if (restoreError) {
        await adminClient.auth.admin.updateUserById(data.userId, { ban_duration: "876000h" });
        throw new Error("Não foi possível restaurar o registo de acesso. A conta permaneceu bloqueada.");
      }
    } else {
      if (access?.revoked_at) return { ok: true as const, active: false };

      const now = new Date().toISOString();
      const { error: revokeError } = access
        ? await adminClient.from("user_access").update({ revoked_at: now }).eq("user_id", data.userId)
        : await adminClient.from("user_access").insert({ user_id: data.userId, valid_until: null, revoked_at: now });

      if (revokeError) throw new Error("Não foi possível desativar o acesso deste utilizador.");

      const { error: banError } = await adminClient.auth.admin.updateUserById(data.userId, {
        ban_duration: "876000h",
      });

      if (banError) {
        await adminClient.from("user_access").update({ revoked_at: access?.revoked_at ?? null }).eq("user_id", data.userId);
        throw new Error("Não foi possível bloquear a conta no sistema de autenticação.");
      }
    }

    return { ok: true as const, active: data.active };
  });
