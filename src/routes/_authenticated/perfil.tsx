import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Smartphone, ChevronDown, UserRound, Mail, CalendarDays, ShieldCheck, FileCode2, Sparkles, Clock3, Camera } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil e histórico — Trakify" },
      { name: "description", content: "Veja todos os scripts que você criou no Trakify." },
      { property: "og:title", content: "Perfil e histórico — Trakify" },
      { property: "og:description", content: "Todos os seus scripts em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { user } = Route.useRouteContext();
  const [aberto, setAberto] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(String(user.user_metadata?.["avatar_url"] || user.user_metadata?.["picture"] || "") || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["scripts", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("scripts").select("id,tipo,titulo,conteudo,created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const nome = user.user_metadata?.["full_name"] || user.user_metadata?.["name"] || "Utilizador";

  const iniciais = String(nome).trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Escolhe uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      toast.success("Foto de perfil atualizada!");
    } catch (error) {
      console.error("Erro ao atualizar foto de perfil:", error);
      toast.error("Não foi possível guardar a foto. Tenta novamente.");
    } finally {
      setUploadingAvatar(false);
    }
  }
  const totalScripts = data?.length ?? 0;
  const dataCriacao = user.created_at ? new Date(user.created_at).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" }) : "Conta Trakify";

  return (
    <AppShell back wide>
      <div className="space-y-7 pb-10">
        <section className="relative overflow-hidden rounded-3xl border border-red-500/25 bg-slate-950 p-5 text-white shadow-[0_18px_55px_rgba(0,0,0,0.22)] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-red-400/60 bg-gradient-to-br from-red-500 to-rose-800 text-2xl font-black text-white shadow-[0_0_30px_rgba(239,68,68,0.28)] sm:h-24 sm:w-24 sm:text-3xl">
                {avatarUrl ? <img src={avatarUrl} alt="Foto do perfil" className="h-full w-full object-cover" /> : iniciais || <UserRound className="h-9 w-9" />}
              </div>
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200"><ShieldCheck className="h-3.5 w-3.5" /> Conta Trakify</div>
                <h1 className="truncate font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{nome}</h1>
                <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-300"><Mail className="h-4 w-4 shrink-0 text-red-300" />{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 backdrop-blur sm:self-center"><Sparkles className="h-4 w-4 text-red-300" /> Perfil do utilizador</div>
          </div>
          <div className="relative mt-5">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:-translate-y-0.5 hover:bg-red-500/20">
              <Camera className="h-4 w-4" /> {uploadingAvatar ? "A enviar foto..." : "Alterar foto de perfil"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploadingAvatar} onChange={uploadAvatar} />
            </label>
            <p className="mt-2 text-xs text-slate-400">JPG, PNG ou WebP · máximo 5 MB. A foto também aparece no cabeçalho.</p>
          </div>
          <div className="relative mt-7 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 text-red-300"><CalendarDays className="h-4 w-4" /></span><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Membro desde</p><p className="mt-0.5 text-sm font-semibold text-white">{dataCriacao}</p></div></div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 text-red-300"><FileCode2 className="h-4 w-4" /></span><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Criações guardadas</p><p className="mt-0.5 text-sm font-semibold text-white">{isLoading ? "A carregar..." : totalScripts}</p></div></div>
          </div>
        </section>
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">A tua atividade</p><h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">Histórico de criações</h2><p className="mt-1 text-sm text-muted-foreground">Consulta e copia os conteúdos que criaste na Trakify.</p></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-300"><Clock3 className="h-3.5 w-3.5" /> {totalScripts} {totalScripts === 1 ? "registo" : "registos"}</span>
          </div>
          {isLoading && <div className="rounded-2xl border border-red-500/15 bg-card p-6 text-center text-sm text-muted-foreground"><div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-red-500/20 border-t-red-500" />A carregar o teu histórico...</div>}
          {!isLoading && data?.length === 0 && <div className="rounded-2xl border border-dashed border-red-500/30 bg-card px-6 py-12 text-center shadow-sm"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500"><FileCode2 className="h-7 w-7" /></span><h3 className="mt-4 font-display text-lg font-bold">Ainda não tens criações</h3><p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Quando criares os teus primeiros conteúdos, eles vão aparecer aqui organizados.</p></div>}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {data?.map((s) => (
              <article key={s.id} className="group overflow-hidden rounded-2xl border border-red-500/15 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-500/45 hover:shadow-[0_14px_35px_rgba(220,38,38,0.10)]">
                <button onClick={() => setAberto(aberto === s.id ? null : s.id)} aria-expanded={aberto === s.id} className="flex w-full items-center gap-3 p-4 text-left sm:p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-500/10 text-red-500"><Smartphone className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-bold text-foreground">{s.titulo}</span><span className="mt-1 block text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString("pt-PT")} · {s.tipo}</span></span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-red-500 ${aberto === s.id ? "rotate-180" : ""}`} />
                </button>
                {aberto === s.id && <div className="border-t border-red-500/10 bg-muted/20 p-4 sm:p-5"><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background p-4 font-sans text-sm leading-relaxed text-foreground">{s.conteudo}</pre><button onClick={() => { navigator.clipboard.writeText(s.conteudo); toast.success("Copiado!"); }} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-red-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-lg active:translate-y-0"><Copy className="h-4 w-4" /> Copiar conteúdo</button></div>}
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
