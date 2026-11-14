import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, CheckCircle2, Eye, EyeOff, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { criarUtilizadorAdmin } from "@/lib/admin-users.functions";

const ADMIN_EMAIL = "ednercioazariasbonhane2@gmail.com";

export const Route = createFileRoute("/_authenticated/usuarios")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validityDays, setValidityDays] = useState("30");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      const allowed = data.user?.email?.toLowerCase() === ADMIN_EMAIL;
      if (!active) return;
      setIsAdmin(allowed);
      if (!allowed) navigate({ to: "/", replace: true });
    });
    return () => { active = false; };
  }, [navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setCreatedEmail("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (sessionError || !accessToken) throw new Error("A tua sessão terminou. Entra novamente.");

      const result = await criarUtilizadorAdmin({
        data: {
          accessToken,
          name,
          email,
          password,
          validityDays: Number(validityDays),
        },
      });
      if (!result.ok) throw new Error("Não foi possível criar a conta.");

      setCreatedEmail(result.email);
      setName("");
      setEmail("");
      setPassword("");
      toast.success("Utilizador criado e validade ativada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro ao criar o utilizador.");
    } finally {
      setLoading(false);
    }
  }

  if (isAdmin === null) {
    return <AppShell><div className="mx-auto max-w-xl py-16 text-center text-sm text-muted-foreground">A verificar autorização...</div></AppShell>;
  }

  if (!isAdmin) return null;

  const inputClass = "h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/15";

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:-translate-x-0.5 hover:bg-secondary hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao painel
        </Link>

        <section className="overflow-hidden rounded-3xl border border-red-500/20 bg-card shadow-sm">
          <div className="border-b border-border bg-gradient-to-br from-red-500/10 via-card to-card p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">Administração exclusiva</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Adicionar utilizador</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Cria uma conta e define durante quantos dias a pessoa poderá utilizar a Trakify.</p>
          </div>

          <form onSubmit={submit} className="space-y-5 p-6 sm:p-8">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Nome completo</span>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do utilizador" autoComplete="name" minLength={2} maxLength={100} required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Endereço de email</span>
              <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="utilizador@exemplo.com" autoComplete="email" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Senha inicial</span>
              <div className="relative">
                <input className={`${inputClass} pr-12`} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete="new-password" minLength={8} maxLength={128} required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Esconder senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">A senha é enviada diretamente ao servidor e não é guardada na base de dados da aplicação.</p>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Validade do acesso</span>
              <div className="relative">
                <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                <input className={`${inputClass} pl-11 pr-20`} type="number" inputMode="numeric" min={1} max={3650} step={1} value={validityDays} onChange={(e) => setValidityDays(e.target.value)} required />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground">A contagem começa no momento em que a conta é criada. Máximo: 3650 dias.</p>
            </label>

            {createdEmail && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div><p className="font-semibold">Conta criada com sucesso</p><p className="mt-1 text-muted-foreground">{createdEmail}</p></div>
              </div>
            )}

            <Button type="submit" disabled={loading || !name.trim() || !email.trim() || password.length < 8 || !Number.isInteger(Number(validityDays)) || Number(validityDays) < 1 || Number(validityDays) > 3650} className="h-14 w-full rounded-xl bg-red-600 text-base font-bold text-white shadow-[0_8px_24px_rgba(220,38,38,0.22)] transition-all duration-200 hover:-translate-y-1 hover:bg-red-500 hover:shadow-[0_14px_32px_rgba(220,38,38,0.35)] active:translate-y-0 disabled:opacity-60">
              <UserPlus className="mr-2 h-5 w-5" /> {loading ? "A criar conta..." : "Criar utilizador"}
            </Button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
