import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, FileText, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StatusChip } from "@/components/StatusChip";
import {
  PEDIDO_STATUS_LABEL,
  PEDIDO_STATUS_ORDER,
  PEDIDO_STATUS_TONE,
  type PedidoStatus,
} from "@/lib/pedidos";

type PedidoRow = {
  id: string;
  user_id: string;
  titulo_estudo: string;
  descricao: string;
  dados_pretendidos: string;
  finalidade: string;
  status: PedidoStatus;
  created_at: string;
  updated_at: string;
};

type HistoricoRow = {
  id: string;
  status_anterior: PedidoStatus | null;
  status_novo: PedidoStatus;
  alterado_por: string;
  nota: string | null;
  created_at: string;
};

export function PedidosTab({ adminUserId }: { adminUserId: string | undefined }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PedidoStatus | "todos">("todos");
  const [openId, setOpenId] = useState<string | null>(null);

  const pedidosQ = useQuery({
    queryKey: ["admin", "pedidos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos_dataset")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PedidoRow[];
    },
  });

  const profilesQ = useQuery({
    queryKey: ["admin", "profiles-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, institution");
      if (error) throw error;
      return data ?? [];
    },
  });

  const profileMap = useMemo(() => {
    const m = new Map<string, { name: string; email: string; institution: string | null }>();
    (profilesQ.data ?? []).forEach((p) =>
      m.set(p.id, { name: p.full_name || p.email, email: p.email, institution: p.institution }),
    );
    return m;
  }, [profilesQ.data]);

  const filtered = useMemo(() => {
    const all = pedidosQ.data ?? [];
    return all.filter((p) => {
      if (statusFilter !== "todos" && p.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const profile = profileMap.get(p.user_id);
      return (
        p.titulo_estudo.toLowerCase().includes(q) ||
        profile?.name.toLowerCase().includes(q) ||
        profile?.email.toLowerCase().includes(q) ||
        false
      );
    });
  }, [pedidosQ.data, statusFilter, search, profileMap]);

  const openPedido = (pedidosQ.data ?? []).find((p) => p.id === openId) ?? null;

  return (
    <div className="rounded-3xl bg-surface-container-low p-6 md:p-8">
      <header className="mb-6">
        <h2 className="font-display text-xl font-bold text-on-surface">Pedidos de Dataset</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Acompanhe e atualize o estado dos pedidos submetidos pelos investigadores. Cada
          alteração é registada no histórico e visível ao investigador.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por título, investigador, email…"
            className="w-full rounded-lg bg-surface-container-lowest py-3 pl-10 pr-4 text-sm text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PedidoStatus | "todos")}
          className="rounded-lg bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
        >
          <option value="todos">Todos os estados</option>
          {PEDIDO_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {PEDIDO_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl">
        <div className="grid grid-cols-12 bg-surface-container px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          <div className="col-span-5">Estudo</div>
          <div className="col-span-3">Investigador</div>
          <div className="col-span-2">Submetido</div>
          <div className="col-span-2">Estado</div>
        </div>
        {pedidosQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-on-surface-variant">
            Nenhum pedido para os filtros aplicados.
          </p>
        ) : (
          <ul>
            {filtered.map((p) => {
              const profile = profileMap.get(p.user_id);
              const date = new Date(p.created_at).toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              return (
                <li key={p.id}>
                  <button
                    onClick={() => setOpenId(p.id)}
                    className="grid w-full grid-cols-12 items-center gap-3 px-5 py-4 text-left text-sm transition-colors hover:bg-surface-container-high"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-on-surface">{p.titulo_estudo}</p>
                        <p className="truncate text-xs text-on-surface-variant">{p.finalidade}</p>
                      </div>
                    </div>
                    <div className="col-span-3 min-w-0">
                      <p className="truncate text-on-surface">{profile?.name ?? "—"}</p>
                      <p className="truncate text-xs text-on-surface-variant">
                        {profile?.institution ?? profile?.email ?? ""}
                      </p>
                    </div>
                    <div className="col-span-2 text-xs text-on-surface-variant">{date}</div>
                    <div className="col-span-2 flex items-center gap-2">
                      <StatusChip tone={PEDIDO_STATUS_TONE[p.status]} dot>
                        {PEDIDO_STATUS_LABEL[p.status]}
                      </StatusChip>
                      <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {openPedido && (
        <PedidoDetailDrawer
          pedido={openPedido}
          investigador={profileMap.get(openPedido.user_id)}
          adminUserId={adminUserId}
          onClose={() => setOpenId(null)}
          onChanged={() => {
            void qc.invalidateQueries({ queryKey: ["admin", "pedidos"] });
          }}
        />
      )}
    </div>
  );
}

function PedidoDetailDrawer({
  pedido,
  investigador,
  adminUserId,
  onClose,
  onChanged,
}: {
  pedido: PedidoRow;
  investigador: { name: string; email: string; institution: string | null } | undefined;
  adminUserId: string | undefined;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [novoStatus, setNovoStatus] = useState<PedidoStatus>(pedido.status);
  const [nota, setNota] = useState("");

  const historicoQ = useQuery({
    queryKey: ["admin", "pedido-historico", pedido.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos_historico")
        .select("*")
        .eq("pedido_id", pedido.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as HistoricoRow[];
    },
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      if (!adminUserId) throw new Error("Sessão inválida");
      if (novoStatus === pedido.status && !nota.trim()) {
        throw new Error("Altere o estado ou escreva uma nota.");
      }
      // Atualiza o estado se mudou
      if (novoStatus !== pedido.status) {
        const { error: updErr } = await supabase
          .from("pedidos_dataset")
          .update({ status: novoStatus })
          .eq("id", pedido.id);
        if (updErr) throw updErr;
      }
      // Regista no histórico
      const { error: histErr } = await supabase.from("pedidos_historico").insert({
        pedido_id: pedido.id,
        status_anterior: pedido.status,
        status_novo: novoStatus,
        alterado_por: adminUserId,
        nota: nota.trim() || null,
      });
      if (histErr) throw histErr;
    },
    onSuccess: () => {
      toast.success("Pedido atualizado");
      setNota("");
      onChanged();
      onClose();
    },
    onError: (e: Error) => toast.error("Falha ao atualizar", { description: e.message }),
  });

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex w-full max-w-xl flex-col overflow-y-auto bg-surface-container-lowest shadow-tonal-lg">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-outline-variant/20 bg-surface-container-lowest px-6 py-5">
          <div className="min-w-0">
            <p className="label-eyebrow">Pedido de Dataset</p>
            <h3 className="mt-1 font-display text-xl font-bold text-on-surface">
              {pedido.titulo_estudo}
            </h3>
            <p className="mt-1 truncate text-xs text-on-surface-variant">
              {investigador?.name ?? "—"} · {investigador?.email ?? ""}
              {investigador?.institution ? ` · ${investigador.institution}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-highest"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-6 px-6 py-6">
          <div>
            <p className="label-eyebrow">Descrição</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-on-surface">{pedido.descricao}</p>
          </div>
          <div>
            <p className="label-eyebrow">Dados pretendidos</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-on-surface">
              {pedido.dados_pretendidos}
            </p>
          </div>
          <div>
            <p className="label-eyebrow">Finalidade</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-on-surface">{pedido.finalidade}</p>
          </div>

          <div className="rounded-2xl bg-surface-container-low p-5">
            <p className="label-eyebrow">Atualizar estado</p>
            <select
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value as PedidoStatus)}
              className="mt-3 w-full rounded-lg bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
            >
              {PEDIDO_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {PEDIDO_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <p className="mt-4 label-eyebrow">Nota para o investigador (opcional)</p>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
              placeholder="Ex: Faltam detalhes sobre o período pretendido…"
              className="mt-2 w-full rounded-lg bg-surface-container-lowest px-4 py-3 text-sm text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
            />
            <button
              onClick={() => updateMut.mutate()}
              disabled={updateMut.isPending}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-tonal disabled:opacity-50"
            >
              {updateMut.isPending ? "A guardar…" : "Registar alteração"}
            </button>
          </div>

          <div>
            <p className="label-eyebrow">Histórico</p>
            {historicoQ.isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (historicoQ.data?.length ?? 0) === 0 ? (
              <p className="mt-3 text-sm text-on-surface-variant">Sem alterações registadas.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {historicoQ.data!.map((h) => (
                  <li
                    key={h.id}
                    className="rounded-lg bg-surface-container-low p-4 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {h.status_anterior && (
                        <>
                          <StatusChip tone={PEDIDO_STATUS_TONE[h.status_anterior]}>
                            {PEDIDO_STATUS_LABEL[h.status_anterior]}
                          </StatusChip>
                          <span className="text-xs text-on-surface-variant">→</span>
                        </>
                      )}
                      <StatusChip tone={PEDIDO_STATUS_TONE[h.status_novo]} dot>
                        {PEDIDO_STATUS_LABEL[h.status_novo]}
                      </StatusChip>
                      <span className="ml-auto text-xs text-on-surface-variant">
                        {new Date(h.created_at).toLocaleString("pt-PT", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {h.nota && (
                      <p className="mt-2 whitespace-pre-wrap text-on-surface">{h.nota}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
