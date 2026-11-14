export type RespostasVendas = {
  produto: string;
  o_que_faz: string;
  publico: string;
  preco: string;
  prova: string;
  estilo: string;
};

export function gerarCopyVendas(r: RespostasVendas): string {
  const prova = r.prova.trim()
    ? r.prova
    : "Ainda não foi fornecida prova social. Adiciona apenas avaliações, números ou resultados reais, com autorização para os divulgar.";
  const estilo = r.estilo || "Visual profissional, responsivo e coerente com a identidade da marca.";

  return \`🛍️ PÁGINA DE VENDAS — \${r.produto.toUpperCase()}

1. HERO — PRIMEIRA IMPRESSÃO
Título principal:
Conhece \${r.produto}: uma forma de \${r.o_que_faz.toLowerCase()}.

Subtítulo:
Pensado para \${r.publico}, com uma apresentação clara do que o produto oferece e de como pode ajudar.

Botão principal:
QUERO SABER MAIS SOBRE \${r.produto.toUpperCase()}

2. IDENTIFICAÇÃO DA NECESSIDADE
Se procuras uma forma de \${r.o_que_faz.toLowerCase()}, é importante escolher uma solução adequada à tua realidade.
Esta secção deve explicar a necessidade que o produto procura atender, sem exagerar resultados nem prometer o que não pode ser comprovado.

3. APRESENTAÇÃO DA SOLUÇÃO
O que é:
\${r.produto}

Como funciona:
\${r.o_que_faz}

Para quem:
\${r.publico}

4. BENEFÍCIOS A EXPLICAR
• Como o produto pode ajudar no dia a dia do público indicado.
• Que tarefa, dificuldade ou objetivo procura atender.
• Como começar a utilizar ou adquirir o produto.
• Que suporte ou acompanhamento está realmente disponível.
Personaliza cada benefício com características confirmadas do produto.

5. O QUE ESTÁ INCLUÍDO
Produto/serviço: \${r.produto}
Descrição fornecida: \${r.o_que_faz}
Acrescenta aqui os módulos, entregáveis, características, condições e limitações reais antes de publicar.

6. PROVA SOCIAL E CREDIBILIDADE
\${prova}
Usa apenas testemunhos autênticos, resultados verificáveis e imagens autorizadas. Se ainda não houver provas, remove esta secção ou substitui por uma demonstração honesta do produto.

7. PREÇO E CONDIÇÕES
Preço informado: \${r.preco}
Explica claramente o que está incluído, se existe pagamento único ou recorrente, os meios de pagamento aceites, entrega/acesso e eventuais custos adicionais. Não publiques descontos ou preços anteriores que não tenham sido confirmados.

8. PERGUNTAS FREQUENTES
• Para quem é indicado? Para \${r.publico}.
• O que vou receber? Explica os entregáveis reais de \${r.produto}.
• Como começo? Descreve o processo verdadeiro de compra, entrega ou ativação.
• Como obtenho ajuda? Indica o canal de suporte realmente disponível.
• Existem condições ou limitações? Apresenta-as de forma transparente.

9. GARANTIA, PRAZOS E DISPONIBILIDADE
Inclui esta secção apenas se existirem condições reais e aprovadas. Informa o prazo, regras de devolução, disponibilidade e limitações. Não inventes garantias, escassez, contagens decrescentes ou prazos.

10. CHAMADA PARA AÇÃO
Botão sugerido:
QUERO ADQUIRIR \${r.produto.toUpperCase()}

Texto de apoio:
Consulta as condições e confirma os detalhes antes de concluir a compra.

11. DIREÇÃO VISUAL
Estilo escolhido: \${estilo}
• Página responsiva e mobile-first.
• Título forte, subtítulo curto e CTA claramente visível.
• Secções bem separadas, cartões consistentes e leitura fácil.
• Imagens reais do produto, com boa qualidade e autorização.
• Contraste acessível e botões fáceis de utilizar.

12. ORIENTAÇÕES PARA IMPLEMENTAÇÃO
Criar uma página rápida e responsiva, com navegação simples, secções nesta ordem e botões ligados ao processo real de contacto ou compra. Validar formulários, mostrar confirmação apenas após sucesso e nunca recolher dados de pagamento diretamente sem integração segura.

13. PROMPT COMPLETO PARA CRIAR A PÁGINA
Cria uma página de vendas profissional para "\${r.produto}". O produto \${r.o_que_faz}. O público-alvo é \${r.publico}. O preço informado é \${r.preco}. Usa o estilo \${estilo}. Inclui hero, apresentação da necessidade, solução, benefícios, conteúdo incluído, prova social apenas se real, preço e condições, perguntas frequentes, garantia apenas se confirmada e chamada para ação. A página deve ser responsiva, rápida, acessível e otimizada para telemóvel. Não inventes testemunhos, resultados, descontos, garantias, urgência ou funcionalidades. Deixa visíveis os pontos que precisam de confirmação antes da publicação.

— Copy estruturada pela Trakify\`;
}
