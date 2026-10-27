import { Smartphone, Video, ShoppingCart, FileText, Sparkles } from "lucide-react";

export const CARDS = [
  { tipo: "app", label: "Criar Aplicativo", icon: Smartphone },
  { tipo: "video", label: "Criar Vídeo", icon: Video },
  { tipo: "pagina-vendas", label: "Criar Página de Vendas", icon: ShoppingCart },
  { tipo: "pagina-documentos", label: "Criar Página de Documentos", icon: FileText },
  { tipo: "prompt", label: "Criar Prompt", icon: Sparkles },
] as const;
