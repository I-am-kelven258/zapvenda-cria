# Zapvenda Cria

Crie um app completo chamado Zapvenda MZ - 


ESTRUTURA:
1. Página de Login/Cadastro: login com Google, campo email/senha. Salvar usuário no Supabase.

2. Dashboard Principal (/) : Header com logo zapvendamz em branco e menu hamburguer. Mostrar saudação "Olá, {nome}". Grid 2 colunas com 8 cards:
- Criar Aplicativo (ícone smartphone)
- Criar Vídeo (ícone video)
- Criar Imagem (ícone imagem)
- Criar Página de Vendas
- Criar Página de Documentos
- Criar Prompt
- Criar Contratos
- Funil de Vendas no WhatsApp
Cada card tem ícone verde e seta. Ao clicar vai para /criar/[tipo]

3. Fluxo de Criação /criar/app : Wizard de 6 perguntas com barra de progresso verde no topo (6 steps). Perguntas:

Pergunta 1: Qual o nome do aplicativo? (placeholder: Ex: Meu App de Finanças...)
Pergunta 2: O que o app faz? (placeholder: Ex: O app ajuda a controlar...)
Pergunta 3: Quem é o público-alvo? (placeholder: Ex: Jovens de 18-35 anos, donos de negócios...)
Pergunta 4: Qual o modelo de monetização? (Placeholder: Ex: Assinatura mensal/Premium
Pergunta 5: Qual o objetivo principal? (placeholder: Ex: Ajudar pessoas a economizar tempo e dinheiro...)
Pergunta 6: Qual o estilo de design? (2 opções grandes clicáveis: [MINIMALISTA - Limpo, branco, simples] e [MODERNO - Dark mode, preto, verde neon, futurista])

DESIGN OBRIGATÓRIO:
- Fundo #000000,
- Header com logo "zapvendamz" em branco no centro
- Barra de progresso no topo com 6 traços verdes, 
- Card da pergunta com fundo #1A1A1A, borda verde #22C55E quando ativo
- Botões: Voltar (cinza escuro) e Próximo (verde #22C55E) - exatamente igual a imagem anexada
- Botão flutuante verde WhatsApp canto inferior direito linkando para wa.me/258858941859

FUNCIONAMENTO:
- Ao clicar em Próximo, salva resposta no state e vai para próxima pergunta.
- Na última pergunta (6), ao clicar em Próximo, gera a página de RESULTADO FINAL com o SCRIPT COMPLETO formatado com ícones 📱🎯👥💰 etc, igual o zapvendamz gera.
- Salvar no Supabase tabela scripts com colunas: nome_app, o_que_faz, publico, monetizacao, objetivo, estilo, script_completo, user_id

Stack: Next.js, Tailwind, Supabase, Shadcn. Mobile first.


Botões Voltar e Próximo verde. No final, gerar script completo usando IA (simular geração) e mostrar em uma página com botão Copiar Script e Salvar.

4. Histórico: Salvar todos os scripts criados no Supabase tabela "scripts" (user_id, tipo, titulo, conteudo, created_at). Listar no perfil.

6. Botão Flutuante WhatsApp: Botão verde fixo canto inferior direito, com ícone headset, ao clicar abre wa.me/258858941859 com mensagem "Olá, preciso de suporte no Zapvenda MZ"

TECNOLOGIA: Next.js 14, Tailwind, Supabase Auth e Database, Lucide Icons, Shadcn/UI.
Crie tudo funcional e com dados mockados bonitos.

Respostas às perguntas de configuração:
- Stack: pode criar com React, Tailwind e shadcn/ui no lugar de Next.js.
- Backend: Lovable Cloud (login e banco de dados).
- Outros 7 cards de criação: abrir uma página "Em breve".

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://zapvenda-cria.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/88b11a7e-dc7b-4c04-bf66-9c6d357f9f92).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
