import { Smartphone, Video, ShoppingCart, BrainCircuit, Sparkles, ChartNoAxesCombined } from "lucide-react";

export const CARDS = [
  { tipo: "app", label: "Criar Aplicativo", icon: Smartphone },
  { tipo: "video", label: "Criar Vídeo", icon: Video },
  { tipo: "pagina-vendas", label: "Criar Página de Vendas", icon: ShoppingCart },
  { tipo: "pagina-documentos", label: "Banco de IA", icon: BrainCircuit },
  { tipo: "prompt", label: "Criar Prompt", icon: Sparkles },
  { tipo: "integracoes", label: "Integrações e Vendas", icon: ChartNoAxesCombined },
] as const;
