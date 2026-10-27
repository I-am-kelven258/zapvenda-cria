export type RespostasVendas = {
  produto: string;
  o_que_faz: string;
  publico: string;
  preco: string;
  prova: string;
  estilo: string;
};

export function gerarCopyVendas(r: RespostasVendas): string {
  return `🛒 PÁGINA DE VENDAS — ${r.produto.toUpperCase()}

🔥 TÍTULO PRINCIPAL
${r.produto}: a solução que ${r.publico} estava esperando

✨ SUBTÍTULO
${r.o_que_faz}

😣 O PROBLEMA
Você já sentiu que perde tempo e dinheiro sem resultados? Para ${r.publico}, isso é mais comum do que parece.

✅ A SOLUÇÃO
Com ${r.produto}, você ${r.o_que_faz.toLowerCase()} de forma simples e rápida.

💎 BENEFÍCIOS
✅ Resultados rápidos e práticos
✅ Feito para ${r.publico}
✅ Fácil de usar desde o primeiro dia
✅ Suporte direto pelo WhatsApp

⭐ PROVA SOCIAL
${r.prova}

💰 OFERTA
De ~~preço cheio~~ por apenas ${r.preco}
🎁 Bônus exclusivo para quem comprar hoje

🛡️ GARANTIA
Satisfação garantida ou seu dinheiro de volta.

👉 CHAMADA PARA AÇÃO
QUERO O ${r.produto.toUpperCase()} AGORA

🎨 ESTILO DA PÁGINA
${r.estilo}

⚡ Gerado por zapvendamz`;
}
