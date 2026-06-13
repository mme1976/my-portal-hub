import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, FileText, Loader2, Plus, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { StatusChip } from "@/components/StatusChip";
import {
  PEDIDO_STATUS_LABEL,
  PEDIDO_STATUS_TONE,
  type PedidoStatus,
} from "@/lib/pedidos";
import { useProtocolo } from "@/lib/auth/protocolo-context";

type PedidoRow = {
  id: string;
  titulo_estudo: string;
  finalidade: string;
  status: PedidoStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
  autor?: { full_name: string | null; email: string } | null;
};

type HistoricoRow = {
  id: string;
  status_anterior: PedidoStatus | null;
  status_novo: PedidoStatus;
  nota: string | null;
  created_at: string;
};

export function MeusPedidos({ userId }: { userId: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { activeId, active } = useProtocolo();

  const pedidosQ = useQuery({
    queryKey: ["pedidos-protocolo", activeId ?? "none"],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos_dataset")
        .select("id, titulo_estudo, finalidade, status, user_id, created_at, updated_at")
        .eq("protocolo_id", activeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as PedidoRow[];
      const ids = Array.from(new Set(rows.map((r) => r.user_id)));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", ids);
        const m = new Map((profs ?? []).map((p) => [p.id, p]));
        rows.forEach((r) => {
          const p = m.get(r.user_id);
          r.autor = p ? { full_name: p.full_name, email: p.email } : null;
        });
      }
      return rows;
    },
  });

  return (
    <section className="mt-10 rounded-3xl bg-surface-container-low p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-on-surface">Pedidos de dataset do protocolo</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {active ? <>A ver pedidos do protocolo <span className="font-semibold text-on-surface">{active.nome}</span>. Inclui pedidos submetidos por todos os investigadores associados.</> : "Selecione um protocolo no topo da página."}
          </p>
        </div>
        <Link
          to="/pedidos/novo"
          className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2.5 text-xs font-semibold text-on-primary shadow-tonal hover:shadow-tonal-lg"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo pedido
        </Link>
      </header>

      <div className="mt-6">
        {!activeId ? null : pedidosQ.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (pedidosQ.data ?? []).length === 0 ? (
          <div className="rounded-2xl bg-surface-container-lowest p-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-on-surface-variant" />
            <p className="mt-4 text-sm text-on-surface-variant">Ainda não existem pedidos neste protocolo.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {(pedidosQ.data ?? []).map((p) => {
              const open = openId === p.id;
              const isMine = p.user_id === userId;
              return (
                <li key={p.id} className="rounded-2xl bg-surface-container-lowest shadow-tonal-sm">
                  <button
                    onClick={() => setOpenId(open ? null : p.id)}
                    className="flex w-full items-start justify-between gap-3 p-5 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-on-surface">{p.titulo_estudo}</p>
                        {!isMine && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-container px-2 py-0.5 text-[0.625rem] font-semibold text-on-tertiary-container">
                            <User className="h-3 w-3" />
                            {p.autor?.full_name || p.autor?.email || "colega"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Submetido a {format(parseISO(p.created_at), "d 'de' MMM yyyy", { locale: pt })}
                        {" · "}
                        atualizado a {format(parseISO(p.updated_at), "d 'de' MMM yyyy", { locale: pt })}
                      </p>
                    </div>
                    <div className="flex flex-none items-center gap-3">
                      <StatusChip tone={PEDIDO_STATUS_TONE[p.status]} dot>
                        {PEDIDO_STATUS_LABEL[p.status]}
                      </StatusChip>
                      {open ? (
                        <ChevronDown className="h-4 w-4 text-on-surface-variant" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                      )}
                    </div>
                  </button>
                  {open && <PedidoDetalhe pedidoId={p.id} finalidade={p.finalidade} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function PedidoDetalhe({ pedidoId, finalidade }: { pedidoId: string; finalidade: string }) {
  const histQ = useQuery({
    queryKey: ["pedido-historico", pedidoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos_historico")
        .select("id, status_anterior, status_novo, nota, created_at")
        .eq("pedido_id", pedidoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as HistoricoRow[];
    },
  });

  return (
    <div className="border-t border-outline-variant/15 px-5 py-5">
      <p className="label-eyebrow">Finalidade do estudo</p>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{finalidade}</p>

      <p className="label-eyebrow mt-6">Histórico</p>
      <div className="mt-3">
        {histQ.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (histQ.data ?? []).length === 0 ? (
          <p className="text-xs text-on-surface-variant">Sem alterações de estado registadas.</p>
        ) : (
          <ol className="relative space-y-4 border-l border-outline-variant/30 pl-5">
            {(histQ.data ?? []).map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip tone={PEDIDO_STATUS_TONE[h.status_novo]} dot>
                    {PEDIDO_STATUS_LABEL[h.status_novo]}
                  </StatusChip>
                  <span className="text-xs text-on-surface-variant">
                    {format(parseISO(h.created_at), "d 'de' MMM yyyy 'às' HH:mm", { locale: pt })}
                  </span>
                </div>
                {h.nota && (
                  <p className="mt-2 rounded-lg bg-surface-container p-3 text-xs leading-relaxed text-on-surface-variant">
                    {h.nota}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
