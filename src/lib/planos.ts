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

// Contacto público de suporte da Trakify (WhatsApp).
export const WHATSAPP_SUPPORT_NUMBER = "258858941859";
export const WHATSAPP_SUPPORT_DISPLAY = "+258 858 941 859";
export const WHATSAPP_SUPPORT_MESSAGE = "Olá! Quero começar a utilizar a Trakify para melhorar as minhas vendas. Gostaria de receber orientação sobre como adquirir um plano.";
export const WHATSAPP_SUPPORT_URL = `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(WHATSAPP_SUPPORT_MESSAGE)}`;
