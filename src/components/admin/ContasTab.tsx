import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Check, X, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StatusChip } from "@/components/StatusChip";

type AccountStatus = "pendente" | "aprovado" | "rejeitado";

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  institution: string | null;
  position: string | null;
  account_status: AccountStatus;
  motivo_rejeicao: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const STATUS_TONE: Record<AccountStatus, "warning" | "success" | "error"> = {
  pendente: "warning",
  aprovado: "success",
  rejeitado: "error",
};

export function ContasTab({ adminUserId }: { adminUserId: string | undefined }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "todos">("pendente");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");

  const profilesQ = useQuery({
    queryKey: ["admin", "profiles-with-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
  });

  const approveMut = useMutation({
    mutationFn: async (userId: string) => {
      if (!adminUserId) throw new Error("Sessão inválida");
      const { error } = await supabase
        .from("profiles")
        .update({
          account_status: "aprovado",
          approved_at: new Date().toISOString(),
          approved_by: adminUserId,
          motivo_rejeicao: null,
        })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Conta aprovada");
      void qc.invalidateQueries({ queryKey: ["admin", "profiles-with-status"] });
    },
    onError: (e: Error) => toast.error("Falha ao aprovar", { description: e.message }),
  });

  const rejectMut = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: "rejeitado", motivo_rejeicao: reason })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Conta rejeitada");
      setRejectingId(null);
      setMotivo("");
      void qc.invalidateQueries({ queryKey: ["admin", "profiles-with-status"] });
    },
    onError: (e: Error) => toast.error("Falha ao rejeitar", { description: e.message }),
  });

  const filtered = useMemo(() => {
    const all = profilesQ.data ?? [];
    return all.filter((p) => {
      if (statusFilter !== "todos" && p.account_status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.full_name?.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.institution?.toLowerCase().includes(q) ||
        false
      );
    });
  }, [profilesQ.data, statusFilter, search]);

  const pendentesCount = (profilesQ.data ?? []).filter((p) => p.account_status === "pendente").length;

  return (
    <div className="rounded-3xl bg-surface-container-low p-6 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-on-surface">Contas de investigador</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Aprove ou rejeite os pedidos de registo. Contas pendentes não podem aceder ao portal.
          </p>
        </div>
        {pendentesCount > 0 && (
          <span className="rounded-full bg-warning-container px-3 py-1.5 text-xs font-bold text-on-warning-container">
            {pendentesCount} pendente(s)
          </span>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, email ou instituição…"
            className="w-full rounded-lg bg-surface-container-lowest py-3 pl-10 pr-4 text-sm text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
          />
        </div>
        <div className="flex gap-1 rounded-full bg-surface-container-lowest p-1 shadow-tonal-sm">
          {(["pendente", "aprovado", "rejeitado", "todos"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={
                statusFilter === s
                  ? "rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-on-primary"
                  : "rounded-full px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface"
              }
            >
              {s === "todos" ? "Todos" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl">
        {profilesQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">
            Nenhuma conta nos filtros aplicados.
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl bg-surface-container-lowest p-5 shadow-tonal-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-tertiary-container font-display text-xs font-bold text-on-tertiary-container">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">
                        {p.full_name || "(sem nome)"}
                      </p>
                      <p className="text-xs text-on-surface-variant">{p.email}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {p.institution ?? "Sem instituição"} · {p.position ?? "Investigador"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip tone={STATUS_TONE[p.account_status]} dot>
                      {STATUS_LABEL[p.account_status]}
                    </StatusChip>
                  </div>
                </div>
                {p.motivo_rejeicao && p.account_status === "rejeitado" && (
                  <p className="mt-3 rounded-lg bg-error-container/40 p-3 text-xs text-on-error-container">
                    <strong>Motivo:</strong> {p.motivo_rejeicao}
                  </p>
                )}
                {p.account_status === "pendente" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => approveMut.mutate(p.id)}
                      disabled={approveMut.isPending}
                      className="inline-flex items-center gap-1.5 rounded-md bg-success-container px-4 py-2 text-xs font-semibold text-on-success-container hover:opacity-90 disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(p.id);
                        setMotivo("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-error-container/70 px-4 py-2 text-xs font-semibold text-on-error-container hover:opacity-90"
                    >
                      <X className="h-3.5 w-3.5" />
                      Rejeitar
                    </button>
                  </div>
                )}
                {rejectingId === p.id && (
                  <div className="mt-3 rounded-lg bg-surface-container-low p-4">
                    <p className="label-eyebrow">Motivo da rejeição</p>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      rows={2}
                      placeholder="Ex: Não foi possível verificar a afiliação institucional."
                      className="mt-2 w-full rounded-md bg-surface-container-lowest px-3 py-2 text-sm outline outline-2 outline-transparent focus:outline-primary"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          if (!motivo.trim()) {
                            toast.error("Indique o motivo");
                            return;
                          }
                          rejectMut.mutate({ id: p.id, reason: motivo.trim() });
                        }}
                        disabled={rejectMut.isPending}
                        className="rounded-md bg-error px-4 py-1.5 text-xs font-semibold text-on-error disabled:opacity-50"
                      >
                        Confirmar rejeição
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setMotivo("");
                        }}
                        className="rounded-md px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
