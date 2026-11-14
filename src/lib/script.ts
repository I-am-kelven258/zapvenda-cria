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
    ? "MODERNO: tema escuro opcional, superfícies profundas, contraste elevado e acentos verde-neon usados com moderação"
    : "MINIMALISTA: fundo claro, tipografia legível, espaço generoso e poucos elementos por ecrã";

  return `📱 PLANO COMPLETO DO APLICATIVO — ${r.nome_app}

1. VISÃO GERAL DO PRODUTO
Nome: ${r.nome_app}
O que faz: ${r.o_que_faz}
Público-alvo: ${r.publico}
Objetivo principal: ${r.objetivo}
Modelo de monetização: ${r.monetizacao}

Resumo: criar uma experiência simples e consistente que ajude ${r.publico} a utilizar ${r.nome_app} para ${r.objetivo.toLowerCase()}.

2. PROPOSTA DE VALOR E EXPERIÊNCIA
• Explicar o benefício principal logo no primeiro acesso.
• Reduzir o número de passos para chegar à funcionalidade central.
• Usar linguagem clara, orientações curtas e estados de carregamento.
• Mostrar mensagens de sucesso, validação e erro que indiquem como continuar.
• Manter navegação previsível em telemóveis, tablets e computadores.

3. PERFIS E PERMISSÕES
• Visitante: pode conhecer o produto e consultar informação pública.
• Utilizador registado: acede às funcionalidades permitidas e aos seus próprios dados.
• Administrador: gere conteúdos e configurações, apenas se essa função fizer parte do projeto.
Definir permissões no servidor e na base de dados; não confiar apenas em esconder botões no ecrã.

4. ESTRUTURA DE ECRÃS
1) Boas-vindas: proposta de valor, benefícios principais e botão de começar.
2) Registo e entrada: formulário simples, recuperação de acesso e validação.
3) Painel principal: resumo, atalhos para a ação principal e atividade recente.
4) Funcionalidade central: fluxo principal de ${r.nome_app}, com passos claros e confirmação das ações.
5) Histórico: lista pesquisável dos registos do próprio utilizador, com estados e datas.
6) Perfil e definições: dados da conta, preferências, privacidade e terminar sessão.
7) Planos e pagamento: apresentar ${r.monetizacao} de forma transparente, se aplicável.
8) Ajuda e suporte: perguntas frequentes e canal de contacto.

5. FUNCIONALIDADES E REGRAS
• Funcionalidade principal: ${r.o_que_faz}.
• Painel personalizado para as necessidades de ${r.publico}.
• Pesquisa, filtros e organização dos registos quando forem úteis.
• Guardar e recuperar dados sem duplicar operações.
• Validar campos obrigatórios e formatos antes de enviar.
• Apresentar estados vazios, carregamento, sucesso e erro.
• Permitir ao utilizador consultar, corrigir ou eliminar os seus dados quando aplicável.
• Registar apenas eventos necessários para compreender a utilização do produto.

6. DADOS E BACKEND
Entidades a considerar, conforme as funcionalidades reais:
• Utilizadores e respetivas preferências.
• Registos criados durante o fluxo principal.
• Planos, subscrições ou pagamentos, caso a monetização os exija.
• Histórico de ações importantes e data de criação/atualização.
Definir relações, campos obrigatórios, índices e regras de retenção antes de implementar. Cada utilizador só deve aceder aos dados que lhe pertencem.

7. SEGURANÇA, PRIVACIDADE E CONFIANÇA
• Autenticação segura e controlo de permissões no servidor.
• Proteger chaves e credenciais em variáveis de ambiente; nunca as colocar no frontend.
• Aplicar regras de acesso na base de dados.
• Validar dados no cliente e novamente no servidor.
• Recolher apenas os dados necessários e explicar como são utilizados.
• Usar ligações seguras e mensagens claras para ações sensíveis.

8. DESIGN E ACESSIBILIDADE
Direção visual: ${estiloTxt}.
• Layout responsivo mobile-first.
• Contraste adequado, texto legível e botões com áreas de toque confortáveis.
• Componentes consistentes, ícones claros e hierarquia visual.
• Navegação por teclado e rótulos acessíveis nos campos.
• Estados de foco, seleção, desativado e carregamento.

9. MONETIZAÇÃO
Modelo indicado: ${r.monetizacao}.
Descrever o que cada plano inclui, limites, preço, periodicidade e forma de cancelamento. Não simular pagamentos nem apresentar cobranças como concluídas sem confirmação do fornecedor de pagamento.

10. TESTES E CRITÉRIOS DE ACEITAÇÃO
• Testar registo, entrada, recuperação de conta e saída.
• Testar o fluxo principal com dados válidos e inválidos.
• Confirmar que um utilizador não consegue consultar dados de outra conta.
• Testar em ecrãs pequenos e grandes.
• Verificar acessibilidade, mensagens de erro e estados sem dados.
• Confirmar que o histórico mantém os dados após atualizar a página.

11. ORDEM RECOMENDADA DE CONSTRUÇÃO
Fase 1: estrutura, navegação e identidade visual.
Fase 2: autenticação, permissões e modelo de dados.
Fase 3: funcionalidade principal e histórico.
Fase 4: monetização, caso aplicável.
Fase 5: testes, correções e preparação para lançamento.

12. PROMPT COMPLETO PARA UMA FERRAMENTA DE DESENVOLVIMENTO
Cria um aplicativo responsivo chamado "${r.nome_app}". O produto deve ${r.o_que_faz}. O público-alvo é ${r.publico} e o objetivo principal é ${r.objetivo}. O modelo de monetização previsto é ${r.monetizacao}. Segue esta direção visual: ${estiloTxt}. Constrói uma experiência mobile-first com boas-vindas, autenticação, painel principal, fluxo da funcionalidade central, histórico, perfil, definições e suporte. Implementa validação, estados de carregamento e erro, acessibilidade, permissões verificadas no servidor e proteção dos dados de cada utilizador. Mantém componentes reutilizáveis e consistência visual. Não inventes integrações, testemunhos, pagamentos ou funcionalidades não especificadas; apresenta decisões em aberto como configurações a confirmar.

13. PONTOS A PERSONALIZAR ANTES DO LANÇAMENTO
Confirmar integrações externas, regras exatas de cada plano, meios de pagamento, política de privacidade, contactos de suporte e requisitos legais aplicáveis.

— Preparado pela Trakify`;
}
