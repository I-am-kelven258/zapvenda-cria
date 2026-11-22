# Auditoria técnica — Integrações de vendas Trakify

Data da análise: 2026-11-22
Branch analisada: `main`
Repositório: `I-am-kelven258/zapvenda-cria`

## Âmbito e limites

Esta auditoria foi feita por leitura do código versionado. Não foi possível confirmar a aplicação das migrations no Supabase, a publicação atual das Edge Functions, a configuração de secrets no ambiente, nem realizar compras/Webhooks reais nas plataformas. Por isso, "implementado no código" não significa "testado em produção".

## Estado encontrado

| Plataforma / identificador no código | O que existe | Estado técnico |
|---|---|---|
| Hotmart (`hotmart`) | Criar configuração, guardar Hottok no servidor, gerar URL individual de Webhook e validar o cabeçalho `X-HOTMART-HOTTOK` | Receção implementada no código; falta confirmar deployment e teste real |
| RatixPay (`ratixpay`) | Criar configuração, guardar segredo e validar assinatura HMAC-SHA256 | Receção implementada no código; falta confirmar que o nome/provedor corresponde ao "RadixPay" referido pelo utilizador, além de deployment e teste real |
| Tutora (`tutora`) | Permite guardar configuração | Não recebe vendas: o webhook devolve HTTP 501 para este provedor |
| EscalePay (`escalepay`) | Permite guardar configuração | Não recebe vendas: o webhook devolve HTTP 501 para este provedor |
| Kiwify (`kiwify`) | Permite guardar configuração | Não recebe vendas: o webhook devolve HTTP 501 para este provedor |
| Calipay / Calipe | Não consta da lista de provedores permitidos nem do seletor da interface | Não implementado no código analisado |
| Scalipay | Não consta da lista de provedores permitidos nem do seletor da interface | Não implementado no código analisado |
| RadixPay | Não consta com este nome; existe apenas `ratixpay` / RatixPay | Identidade do provedor precisa de confirmação antes de reutilizar ou criar integração |

## Ficheiros analisados

- `src/components/IntegracoesVendas.tsx`
- `supabase/functions/create-sales-integration/index.ts`
- `supabase/functions/sales-webhook/index.ts`
- `supabase/migrations/20261114150000_sales_integrations.sql`
- `package.json`

## Problemas e lacunas identificados

1. A lista de provedores está duplicada entre a interface, a Edge Function de criação e a constraint SQL. Atualmente, as três reconhecem apenas Tutora, EscalePay, Hotmart, Kiwify e RatixPay.
2. A função de criação só recolhe segredo e gera URL de Webhook para Hotmart e RatixPay. Para Tutora, EscalePay e Kiwify, guarda apenas preferências e marca a configuração como `provider_docs_pending`.
3. O endpoint de receção só autentica Hotmart e RatixPay. Os restantes provedores recebem resposta HTTP 501, portanto não podem alimentar o painel de vendas.
4. A interface apresenta "Configuração guardada" para cada integração, o que não deve ser confundido com ligação funcional. O estado deve distinguir configuração guardada, aguardando credenciais/documentação, ativa após evento autenticado e erro.
5. O cartão "Plataformas disponíveis" está fixado em 5. Deve derivar da lista real de provedores suportados, incluindo os que forem adicionados depois.
6. A migration contém unicidade por evento e por pedido, mas é necessário testar eventos repetidos, atualizações de estado, reembolsos e payloads sem identificador de pedido.
7. Não há prova no repositório de que as migrations e Edge Functions estejam publicadas no projeto Supabase ligado à aplicação.
8. Não foram encontrados testes automatizados específicos para os adaptadores de Webhook das plataformas.

## Plano de trabalho recomendado

### Prioridade 1 — confirmar identidades e documentação
- Confirmar se "RadixPay" é a mesma empresa/produto que o identificador existente "RatixPay".
- Confirmar os nomes oficiais: "Calipay" ou "Calipe", e "Scalipay" ou "EscalePay".
- Para cada plataforma, obter documentação oficial de Webhooks/API, eventos, autenticação/assinatura, estrutura dos payloads e moedas/unidades.
- Não criar endpoints ou formatos por suposição.

### Prioridade 2 — organizar arquitetura
- Criar um catálogo único de provedores, usado pela interface e servidor.
- Implementar adaptador isolado por plataforma: autenticação, validação do evento, extração de identificadores, valor, moeda, estado, produto e data.
- Só disponibilizar o estado "ativa" depois de validar um evento autêntico; manter os outros estados explícitos.
- Não expor segredos no frontend; guardar credenciais apenas no servidor.

### Prioridade 3 — robustez e testes
- Criar testes unitários com exemplos oficiais/sanitizados de payloads de cada plataforma.
- Testar assinatura inválida, segredo ausente, moeda divergente, valor inválido e eventos desconhecidos.
- Testar idempotência para reenvios e alterações de estado do mesmo pedido.
- Confirmar que vendas aprovadas, pendentes, canceladas, reembolsadas e chargebacks são normalizadas corretamente, conforme os eventos que cada plataforma realmente fornece.

### Prioridade 4 — deployment e validação real
- Confirmar que a migration `20261114150000_sales_integrations.sql` foi aplicada no Supabase.
- Confirmar que `create-sales-integration` e `sales-webhook` estão publicadas.
- Configurar secrets necessários no ambiente seguro do Supabase.
- Fazer teste real/sandbox em cada plataforma e só então marcar como funcional.

## Conclusão

No código atual há uma base de integração, mas não existe suporte de receção automática para todas as plataformas pretendidas. Hotmart e RatixPay têm caminhos de autenticação implementados; Tutora, EscalePay e Kiwify estão apenas preparadas para configuração e aguardam implementação do respetivo protocolo. Calipay/Calipe e Scalipay não estão registadas no código. A correspondência entre RadixPay e RatixPay ainda não está confirmada.

Nenhuma credencial, token, webhook secreto ou dado de cliente foi incluído neste relatório.
