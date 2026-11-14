export type RespostasVideo = {
  objetivo: string;
  apresentar: string;
  pessoa: string;
  tom: string;
  voz: string;
  sotaque: string;
  idade: string;
  ritmo: string;
  cenario: string;
  estilo_visual: string;
  iluminacao: string;
  enquadramento: string;
  publico: string;
  obrigatorio: string;
  formato: string;
  duracao: string;
};

export function gerarRoteiroVideo(r: RespostasVideo): string {
  const semPessoa = r.pessoa.startsWith("Nenhuma");
  const personagem = semPessoa
    ? `Sem pessoas em cena. Usar narração em voz ${r.voz.toLowerCase()}, tom ${r.tom.toLowerCase()}, sotaque de ${r.sotaque}, ritmo ${r.ritmo.toLowerCase()}.`
    : `${r.pessoa}, ${r.idade.toLowerCase()}, comunica com tom ${r.tom.toLowerCase()}, voz ${r.voz.toLowerCase()}, sotaque de ${r.sotaque} e ritmo ${r.ritmo.toLowerCase()}. A atuação deve parecer natural e adequada ao público.`;

  return `🎬 PLANO DE PRODUÇÃO E ROTEIRO DE VÍDEO

1. BRIEFING
Objetivo: ${r.objetivo}
Conteúdo a apresentar: ${r.apresentar}
Público/plataforma: ${r.publico}
Formato: ${r.formato}
Duração pretendida: ${r.duracao}

2. DIREÇÃO CRIATIVA
Personagem/voz: ${personagem}
Cenário: ${r.cenario}
Estilo visual: ${r.estilo_visual}
Iluminação: ${r.iluminacao}
Enquadramento: ${r.enquadramento}
Manter continuidade visual, roupa, cenário, voz e identidade entre planos.

3. ESTRUTURA NARRATIVA
ABERTURA — captar a atenção com uma imagem, pergunta ou frase relacionada com ${r.objetivo}.
CONTEXTO — apresentar rapidamente a necessidade ou tema.
APRESENTAÇÃO — explicar de forma clara: ${r.apresentar}.
PONTO PRINCIPAL — destacar a informação mais importante para ${r.publico}.
FECHO — terminar com a ação ou mensagem obrigatória: ${r.obrigatorio}.

4. PLANO DE CENAS
CENA 1 — GANCHO
Imagem: plano inicial que situa o tema e desperta curiosidade.
Áudio: frase curta relacionada com o objetivo.
Edição: começar diretamente, sem introdução longa.

CENA 2 — CONTEXTO
Imagem: mostrar o cenário ou situação ligada ao tema.
Áudio: explicar a necessidade em linguagem simples.
Edição: transição suave e legendas sincronizadas.

CENA 3 — APRESENTAÇÃO
Imagem: destacar o produto, serviço ou ideia.
Áudio: ${r.apresentar}
Edição: planos de apoio que ajudem a compreender o que está a ser apresentado.

CENA 4 — BENEFÍCIO OU INFORMAÇÃO-CHAVE
Imagem: demonstrar visualmente o ponto mais importante, sem inventar resultados.
Áudio: reforçar a mensagem principal e responder à dúvida mais provável do público.

CENA 5 — CHAMADA PARA AÇÃO
Imagem: enquadramento limpo com a informação essencial.
Áudio/texto obrigatório: ${r.obrigatorio}
Edição: manter a mensagem final legível tempo suficiente.

5. ORIENTAÇÕES DE CAPTAÇÃO E EDIÇÃO
• Respeitar o formato ${r.formato} e a duração ${r.duracao}.
• Manter o assunto principal visível e bem enquadrado.
• Usar iluminação ${r.iluminacao} e cenário ${r.cenario}.
• Adicionar legendas legíveis e rever ortografia.
• Equilibrar voz, música e sons ambientes; a voz deve permanecer compreensível.
• Usar cortes e transições consistentes, sem efeitos que distraiam.
• Confirmar que logótipos, textos, preços e contactos estão corretos.
• Não incluir marcas, pessoas ou alegações sem autorização.

6. TEXTO E ELEMENTOS OBRIGATÓRIOS
${r.obrigatorio}

7. CHECKLIST ANTES DE EXPORTAR
□ A mensagem corresponde ao objetivo.
□ O produto/tema está apresentado corretamente.
□ O formato e a duração estão certos.
□ Voz, legendas e música estão equilibradas.
□ Textos, preços e contactos foram revistos.
□ O vídeo foi visualizado do início ao fim em telemóvel.

8. PROMPT COMPLETO PARA VEO / SORA / FERRAMENTA DE VÍDEO
Produz um vídeo ${r.formato} com duração de ${r.duracao}, cujo objetivo é ${r.objetivo}. Apresenta: ${r.apresentar}. Público e plataforma: ${r.publico}. ${personagem} Cenário: ${r.cenario}. Direção visual: ${r.estilo_visual}. Iluminação: ${r.iluminacao}. Enquadramento: ${r.enquadramento}. Organiza a narrativa em gancho, contexto, apresentação, informação principal e chamada final. Inclui obrigatoriamente: ${r.obrigatorio}. Mantém continuidade entre cenas, composição limpa, áudio inteligível e legendas legíveis. Não inventes textos, logótipos, preços, testemunhos ou resultados.

— Roteiro estruturado pela Trakify`;
}
