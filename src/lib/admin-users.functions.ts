import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { env } from "node:process";

const ADMIN_EMAIL = "ednercioazariasbonhane2@gmail.com";

type CreateUserInput = {
  accessToken: string;
  name: string;
  email: string;
  password: string;
  validityDays: number;
};

function validateInput(value: unknown): CreateUserInput {
  if (!value || typeof value !== "object") throw new Error("Dados inválidos.");
  const data = value as Record<string, unknown>;
  const accessToken = String(data.accessToken ?? "");
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const password = String(data.password ?? "");
  const validityDays = Number(data.validityDays);

  if (!accessToken || accessToken.length > 10000) throw new Error("Sessão inválida. Entra novamente.");
  if (name.length < 2 || name.length > 100) throw new Error("Introduz um nome válido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error("Introduz um email válido.");
  if (password.length < 8 || password.length > 128) throw new Error("A senha deve ter entre 8 e 128 caracteres.");
  if (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 3650) throw new Error("A validade deve ser entre 1 e 3650 dias.");

  return { accessToken, name, email, password, validityDays };
}

export const criarUtilizadorAdmin = createServerFn({ method: "POST" })
  .inputValidator(validateInput)
  .handler(async ({ data }) => {
    const url = env["SUPABASE_URL"];
    const publishableKey = env["SUPABASE_PUBLISHABLE_KEY"];
    const serviceRoleKey = env["SUPABASE_SERVICE_ROLE_KEY"];
    if (!url || !publishableKey || !serviceRoleKey) {
      throw new Error("A configuração segura do servidor está incompleta.");
    }

    const authClient = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: verified, error: authError } = await authClient.auth.getUser(data.accessToken);
    if (authError || !verified.user || verified.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      throw new Error("Não tens autorização para criar utilizadores.");
    }

    const adminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
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
      await adminClient.auth.admin.deleteUser(created.user.id);
      throw new Error("A conta não foi ativada porque não foi possível guardar a validade. Tenta novamente.");
    }

    return { ok: true as const, email: data.email, validUntil };
  });


type ListUsersInput = { accessToken: string };

function validateListUsersInput(value: unknown): ListUsersInput {
  if (!value || typeof value !== "object") throw new Error("Dados inválidos.");
  const accessToken = String((value as Record<string, unknown>).accessToken ?? "");
  if (!accessToken || accessToken.length > 10000) throw new Error("Sessão inválida. Entra novamente.");
  return { accessToken };
}

export const listarUtilizadoresAdmin = createServerFn({ method: "POST" })
  .inputValidator(validateListUsersInput)
  .handler(async ({ data }) => {
    const url = env["SUPABASE_URL"];
    const publishableKey = env["SUPABASE_PUBLISHABLE_KEY"];
    const serviceRoleKey = env["SUPABASE_SERVICE_ROLE_KEY"];
    if (!url || !publishableKey || !serviceRoleKey) {
      throw new Error("A configuração segura do servidor está incompleta.");
    }

    const authClient = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: verified, error: authError } = await authClient.auth.getUser(data.accessToken);
    if (authError || !verified.user || verified.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      throw new Error("Não tens autorização para consultar os utilizadores.");
    }

    const adminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

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
    }

    return {
      total: allUsers.length,
      users: allUsers.map((user) => {
        const access = accessByUserId.get(user.id);
        const metadata = user.user_metadata ?? {};
        return {
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
