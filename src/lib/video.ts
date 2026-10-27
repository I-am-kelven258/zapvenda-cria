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
    ? `Sem pessoas em cena. Narração em voz ${r.voz.toLowerCase()}, tom ${r.tom.toLowerCase()}, sotaque de ${r.sotaque}, ritmo ${r.ritmo.toLowerCase()}.`
    : `${r.pessoa}, ${r.idade.toLowerCase()}, fala com tom ${r.tom.toLowerCase()}, voz ${r.voz.toLowerCase()}, sotaque de ${r.sotaque}, ritmo ${r.ritmo.toLowerCase()}. Olha para a câmera com naturalidade e confiança.`;
  return `🎬 ROTEIRO COMPLETO DE VÍDEO

🎯 OBJETIVO
${r.objetivo}

📦 O QUE APRESENTAR
${r.apresentar}

🧑 PERSONAGEM E FALA
${personagem}

🌍 CENÁRIO E VISUAL
• Local: ${r.cenario}
• Estilo visual: ${r.estilo_visual}
• Iluminação: ${r.iluminacao}
• Enquadramento: ${r.enquadramento}

📢 PÚBLICO E PLATAFORMA
${r.publico}

⚠️ OBRIGATÓRIO NO VÍDEO
${r.obrigatorio}

📐 FORMATO E DURAÇÃO
${r.formato} • ${r.duracao}

🎞️ CENAS
1️⃣ Gancho (primeiros segundos): abertura impactante que chama atenção para "${r.objetivo}".
2️⃣ Problema: mostrar a dor do público que o produto resolve.
3️⃣ Apresentação: ${r.apresentar}
4️⃣ Prova e benefícios: destacar resultados e diferenciais.
5️⃣ Chamada para ação: ${r.obrigatorio}

🚀 PROMPT PARA VEO 3 / SORA / CAPCUT
Crie um vídeo ${r.formato} de ${r.duracao} com o objetivo de ${r.objetivo}. Conteúdo: ${r.apresentar}. ${personagem} Cenário: ${r.cenario}. Estilo visual ${r.estilo_visual}, iluminação ${r.iluminacao}, enquadramento ${r.enquadramento}. Público e plataforma: ${r.publico}. Deve obrigatoriamente aparecer ou ser dito: ${r.obrigatorio}. Cortes dinâmicos, legendas grandes e música de fundo envolvente.

⚡ Gerado por zapvendamz`;
}
