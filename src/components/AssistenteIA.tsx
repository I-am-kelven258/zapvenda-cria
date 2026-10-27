import { useState } from "react";
import { Headset, Send, X, Loader2, Mail } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { perguntarAssistente, SUPORTE_EMAIL } from "@/lib/assistente.functions";

type Msg = { role: "user" | "assistant"; content: string };

export function AjudaEmail() {
  return (
    <div className="text-center text-sm">
      <p className="text-muted-foreground">Precisas de ajuda?</p>
      <a href={`mailto:${SUPORTE_EMAIL}`} className="font-medium text-primary underline-offset-4 hover:underline">{SUPORTE_EMAIL}</a>
    </div>
  );
}

export function AssistenteIA() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: "Olá! Sou a assistente do Zapvenda MZ. Como posso ajudar?" }]);
  const [txt, setTxt] = useState("");
  const [loading, setLoading] = useState(false);
  const perguntar = useServerFn(perguntarAssistente);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const q = txt.trim();
    if (!q || loading) return;
    const novas = [...msgs, { role: "user" as const, content: q }];
    setMsgs(novas);
    setTxt("");
    setLoading(true);
    try {
      const r = await perguntar({ data: { messages: novas.slice(1) } });
      setMsgs([...novas, { role: "assistant", content: r.ok ? r.text : r.error }]);
    } catch {
      setMsgs([...novas, { role: "assistant", content: `Não consegui responder agora. Contacte ${SUPORTE_EMAIL}.` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[520px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-display font-semibold">Assistente IA</span>
            <button onClick={() => setOpen(false)} aria-label="Fechar"><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{m.content}</div>
            ))}
            {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
          <form onSubmit={enviar} className="flex gap-2 border-t border-border p-3">
            <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Escreva sua pergunta..." className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <button type="submit" disabled={loading} aria-label="Enviar" className="rounded-xl bg-primary px-3 text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
          </form>
          <div className="border-t border-border p-3"><AjudaEmail /></div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Assistente IA"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_30px_-6px_var(--primary)] transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <Headset className="h-6 w-6" />}
      </button>
    </>
  );
}

export { Mail };
