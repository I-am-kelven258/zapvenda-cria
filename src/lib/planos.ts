export const PLANOS = [
  {
    id: "mensal",
    nome: "Plano mensal",
    preco: 247,
    periodo: "mês",
    premium: false,
    checkout: "https://pay.tutora.co.mz/993a1110a026416da9eb9815d1569fee",
  },
  {
    id: "trimestral",
    nome: "Plano trimestral",
    preco: 597,
    periodo: "trimestre",
    premium: true,
    checkout: "https://pay.tutora.co.mz/0628eb9010c748faa655c9cda528bc9d",
  },
] as const;