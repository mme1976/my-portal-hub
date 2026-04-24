export type PedidoStatus =
  | "submetido"
  | "em_analise"
  | "pedido_esclarecimento"
  | "aprovado"
  | "rejeitado"
  | "em_anonimizacao"
  | "concluido";

export const PEDIDO_STATUS_LABEL: Record<PedidoStatus, string> = {
  submetido: "Submetido",
  em_analise: "Em análise",
  pedido_esclarecimento: "Pedido de esclarecimento",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  em_anonimizacao: "Processo de anonimização",
  concluido: "Concluído",
};

export const PEDIDO_STATUS_ORDER: PedidoStatus[] = [
  "submetido",
  "em_analise",
  "pedido_esclarecimento",
  "aprovado",
  "rejeitado",
  "em_anonimizacao",
  "concluido",
];

export type PedidoTone = "neutral" | "primary" | "warning" | "success" | "error" | "tertiary";

export const PEDIDO_STATUS_TONE: Record<PedidoStatus, PedidoTone> = {
  submetido: "neutral",
  em_analise: "primary",
  pedido_esclarecimento: "warning",
  aprovado: "success",
  rejeitado: "error",
  em_anonimizacao: "tertiary",
  concluido: "success",
};
