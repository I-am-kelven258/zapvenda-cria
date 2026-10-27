export type Respostas = {
  nome_app: string;
  o_que_faz: string;
  publico: string;
  monetizacao: string;
  objetivo: string;
  estilo: "minimalista" | "moderno" | "";
};

export function gerarScript(r: Respostas): string {
  const moderno = r.estilo === "moderno";
  const estiloTxt = moderno
    ? "MODERNO: dark mode, fundo preto, detalhes em verde neon, visual futurista"
    : "MINIMALISTA: limpo, fundo branco, tipografia simples, muito espaço";
  return `📱 NOME DO APLICATIVO
${r.nome_app}

🧠 O QUE O APP FAZ
${r.o_que_faz}

👥 PÚBLICO-ALVO
${r.publico}

💰 MODELO DE MONETIZAÇÃO
${r.monetizacao}

🎯 OBJETIVO PRINCIPAL
${r.objetivo}

🎨 ESTILO DE DESIGN
${estiloTxt}

🧩 FUNCIONALIDADES PRINCIPAIS
✅ Login com Google e email/senha
✅ Dashboard com resumo personalizado para ${r.publico}
✅ Fluxo principal: ${r.o_que_faz}
✅ Histórico e perfil do usuário
✅ Área ${r.monetizacao} com benefícios exclusivos
✅ Notificações e suporte via WhatsApp

📲 ESTRUTURA DE TELAS
1️⃣ Tela de boas-vindas
2️⃣ Login / Cadastro
3️⃣ Dashboard principal
4️⃣ Tela da funcionalidade central
5️⃣ Planos e pagamento
6️⃣ Perfil e configurações

🚀 PROMPT PARA CRIAR O APP
Crie um aplicativo mobile-first chamado "${r.nome_app}". ${r.o_que_faz}. O público-alvo é ${r.publico}. A monetização será por ${r.monetizacao}. O objetivo principal é ${r.objetivo}. Use o estilo ${estiloTxt}. Inclua login, dashboard, histórico, planos de pagamento e botão de suporte no WhatsApp.

⚡ Gerado por zapvendamz`;
}
