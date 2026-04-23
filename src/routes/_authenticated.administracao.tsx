import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderCog,
  Check,
  X,
  Search,
  Users,
  Building2,
  CalendarDays,
  Loader2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { supabase } from "@/integrations/supabase/client";
import { authSnapshot, useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/_authenticated/administracao")({
  beforeLoad: ({ location }) => {
    if (!authSnapshot.loading && !authSnapshot.isAuthenticated) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
  },
  component: AdminPage,
  head: () => ({ meta: [{ title: "Administração · DGEEC SafeCenter" }] }),
});

type Tab = "reservas" | "postos" | "utilizadores";

function AdminPage() {
  const { hasRole, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("reservas");

  // Client-side role guard (role only known after profile load)
  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!hasRole("admin")) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl py-20 text-center">
          <ShieldOff className="mx-auto h-12 w-12 text-on-surface-variant" />
          <h1 className="mt-6 font-display text-3xl font-extrabold text-on-surface">
            Acesso restrito
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            Esta secção é exclusiva a administradores do DGEEC SafeCenter. Se considera que
            deveria ter acesso, contacte o gestor institucional do portal.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="label-eyebrow">Gestão Institucional</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-on-surface">
            Administração
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">
            Gestão de reservas, postos de trabalho e utilizadores do DGEEC SafeCenter.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-1 border-b border-outline-variant/20">
          {(
            [
              { id: "reservas", label: "Reservas", icon: CalendarDays },
              { id: "postos", label: "Postos", icon: Building2 },
              { id: "utilizadores", label: "Utilizadores", icon: Users },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  active
                    ? "relative flex items-center gap-2 px-5 py-3 font-display text-sm font-bold text-primary after:absolute after:bottom-[-1px] after:left-3 after:right-3 after:h-[3px] after:rounded-full after:bg-primary"
                    : "flex items-center gap-2 px-5 py-3 font-display text-sm font-medium text-on-surface-variant hover:text-on-surface"
                }
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {tab === "reservas" && <ReservasTab />}
          {tab === "postos" && <PostosTab />}
          {tab === "utilizadores" && <UtilizadoresTab />}
        </div>
      </div>
    </AppShell>
  );
}

/* ─────────────────────────── RESERVAS ─────────────────────────── */

type ReservaRow = {
  id: string;
  reserva_date: string;
  start_time: string;
  end_time: string;
  status: "confirmada" | "cancelada" | "concluida";
  notes: string | null;
  user_id: string;
  posto_id: string;
};

function ReservasTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todas" | "confirmada" | "cancelada">("todas");

  const reservasQ = useQuery({
    queryKey: ["admin", "reservas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .order("reserva_date", { ascending: false })
        .order("start_time", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as ReservaRow[];
    },
  });

  const postosQ = useQuery({
    queryKey: ["admin", "postos-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase.from("postos").select("id, name, code");
      if (error) throw error;
      return data ?? [];
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

  const cancelMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reservas").update({ status: "cancelada" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reserva cancelada");
      void qc.invalidateQueries({ queryKey: ["admin", "reservas"] });
    },
    onError: (e: Error) => toast.error("Não foi possível cancelar", { description: e.message }),
  });

  const postoMap = useMemo(() => {
    const m = new Map<string, { name: string; code: string }>();
    (postosQ.data ?? []).forEach((p) => m.set(p.id, { name: p.name, code: p.code }));
    return m;
  }, [postosQ.data]);

  const profileMap = useMemo(() => {
    const m = new Map<string, { name: string; email: string; institution: string | null }>();
    (profilesQ.data ?? []).forEach((p) =>
      m.set(p.id, { name: p.full_name || p.email, email: p.email, institution: p.institution }),
    );
    return m;
  }, [profilesQ.data]);

  const filtered = useMemo(() => {
    const all = reservasQ.data ?? [];
    return all.filter((r) => {
      if (statusFilter !== "todas" && r.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const posto = postoMap.get(r.posto_id);
      const profile = profileMap.get(r.user_id);
      return (
        posto?.name.toLowerCase().includes(q) ||
        posto?.code.toLowerCase().includes(q) ||
        profile?.name.toLowerCase().includes(q) ||
        profile?.email.toLowerCase().includes(q) ||
        false
      );
    });
  }, [reservasQ.data, statusFilter, search, postoMap, profileMap]);

  const isLoading = reservasQ.isLoading || postosQ.isLoading || profilesQ.isLoading;

  return (
    <div className="rounded-3xl bg-surface-container-low p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por investigador, email, posto…"
            className="w-full rounded-lg bg-surface-container-lowest py-3 pl-10 pr-4 text-sm text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
          />
        </div>
        <div className="flex gap-1 rounded-full bg-surface-container-lowest p-1 shadow-tonal-sm">
          {(["todas", "confirmada", "cancelada"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={
                statusFilter === s
                  ? "rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-on-primary"
                  : "rounded-full px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface"
              }
            >
              {s === "todas" ? "Todas" : s === "confirmada" ? "Confirmadas" : "Canceladas"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl">
        <div className="grid grid-cols-12 bg-surface-container px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          <div className="col-span-4">Investigador</div>
          <div className="col-span-3">Posto</div>
          <div className="col-span-3">Data / Horário</div>
          <div className="col-span-1">Estado</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-on-surface-variant">
            Sem reservas para os filtros aplicados.
          </p>
        ) : (
          <ul>
            {filtered.map((r) => {
              const posto = postoMap.get(r.posto_id);
              const profile = profileMap.get(r.user_id);
              const initials =
                (profile?.name ?? "?")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join("") || "?";
              const tone =
                r.status === "confirmada"
                  ? ("success" as const)
                  : r.status === "cancelada"
                    ? ("error" as const)
                    : ("neutral" as const);
              const dateLabel = new Date(r.reserva_date + "T00:00:00").toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-12 items-center gap-3 px-5 py-4 text-sm transition-colors hover:bg-surface-container-high"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-container font-display text-xs font-bold text-on-tertiary-container">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-on-surface">
                        {profile?.name ?? "Utilizador desconhecido"}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant">
                        {profile?.institution ?? profile?.email ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="font-semibold text-on-surface">{posto?.name ?? "—"}</p>
                    <p className="font-mono text-[0.6875rem] text-on-surface-variant">
                      {posto?.code ?? ""}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="font-semibold text-on-surface">{dateLabel}</p>
                    <p className="text-xs text-on-surface-variant">
                      {r.start_time.slice(0, 5)} – {r.end_time.slice(0, 5)}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <StatusChip tone={tone} dot>
                      {r.status === "confirmada"
                        ? "Confirmada"
                        : r.status === "cancelada"
                          ? "Cancelada"
                          : "Concluída"}
                    </StatusChip>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {r.status === "confirmada" ? (
                      <button
                        onClick={() => {
                          if (confirm(`Cancelar a reserva de ${profile?.name ?? "este utilizador"} no ${posto?.name ?? "posto"}?`)) {
                            cancelMut.mutate(r.id);
                          }
                        }}
                        disabled={cancelMut.isPending}
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-error-container/70 text-on-error-container transition-opacity hover:opacity-90 disabled:opacity-40"
                        title="Cancelar reserva"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-on-surface-variant/60">—</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── POSTOS ─────────────────────────── */

type PostoRow = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  available: boolean;
};

function PostosTab() {
  const qc = useQueryClient();

  const postosQ = useQuery({
    queryKey: ["admin", "postos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("postos")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PostoRow[];
    },
  });

  const toggleMut = useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      const { error } = await supabase.from("postos").update({ available }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estado do posto atualizado");
      void qc.invalidateQueries({ queryKey: ["admin", "postos"] });
    },
    onError: (e: Error) => toast.error("Falha ao atualizar posto", { description: e.message }),
  });

  return (
    <div className="rounded-3xl bg-surface-container-low p-6 md:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-on-surface">Postos de Trabalho</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Ative ou desative postos. Postos inativos não aparecem disponíveis para reserva.
          </p>
        </div>
        <FolderCog className="h-6 w-6 text-on-surface-variant" />
      </header>

      {postosQ.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (postosQ.data?.length ?? 0) === 0 ? (
        <p className="py-12 text-center text-sm text-on-surface-variant">
          Ainda não existem postos. Adicione-os pelo painel de gestão da base de dados.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {postosQ.data!.map((p) => (
            <li
              key={p.id}
              className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-4 pl-5 shadow-tonal-sm"
            >
              <span
                className={`absolute left-0 top-0 h-full w-1 ${p.available ? "bg-success" : "bg-error"}`}
              />
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-on-surface">{p.name}</p>
                    <span className="font-mono text-[0.6875rem] text-on-surface-variant">
                      {p.code}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {p.available ? "Disponível para reserva" : "Indisponível / manutenção"}
                  </p>
                  {p.description && (
                    <p className="mt-2 text-xs text-on-surface-variant/80">{p.description}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleMut.mutate({ id: p.id, available: !p.available })}
                  disabled={toggleMut.isPending}
                  className={
                    p.available
                      ? "relative inline-flex h-6 w-11 flex-none items-center rounded-full bg-primary transition-colors disabled:opacity-50"
                      : "relative inline-flex h-6 w-11 flex-none items-center rounded-full bg-outline-variant/40 transition-colors disabled:opacity-50"
                  }
                  aria-label={p.available ? "Desativar posto" : "Ativar posto"}
                >
                  <span
                    className={
                      p.available
                        ? "absolute left-[22px] h-5 w-5 rounded-full bg-on-primary transition-all"
                        : "absolute left-[2px] h-5 w-5 rounded-full bg-on-surface transition-all"
                    }
                  />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─────────────────────────── UTILIZADORES ─────────────────────────── */

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  institution: string | null;
  position: string | null;
  created_at: string;
};

function UtilizadoresTab() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const profilesQ = useQuery({
    queryKey: ["admin", "all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
  });

  const rolesQ = useQuery({
    queryKey: ["admin", "all-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return data ?? [];
    },
  });

  const adminSet = useMemo(() => {
    const s = new Set<string>();
    (rolesQ.data ?? []).forEach((r) => {
      if (r.role === "admin") s.add(r.user_id);
    });
    return s;
  }, [rolesQ.data]);

  const promoteMut = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Utilizador promovido a administrador");
      void qc.invalidateQueries({ queryKey: ["admin", "all-roles"] });
    },
    onError: (e: Error) => toast.error("Falha ao promover", { description: e.message }),
  });

  const demoteMut = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Permissão de administrador removida");
      void qc.invalidateQueries({ queryKey: ["admin", "all-roles"] });
    },
    onError: (e: Error) => toast.error("Falha ao remover permissão", { description: e.message }),
  });

  const filtered = useMemo(() => {
    const all = profilesQ.data ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (p) =>
        p.full_name?.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.institution?.toLowerCase().includes(q),
    );
  }, [profilesQ.data, search]);

  const isLoading = profilesQ.isLoading || rolesQ.isLoading;

  return (
    <div className="rounded-3xl bg-surface-container-low p-6 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-on-surface">Utilizadores</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Gestão de investigadores e administradores do portal.
          </p>
        </div>
        <div className="relative min-w-[260px] flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, email, instituição…"
            className="w-full rounded-lg bg-surface-container-lowest py-2.5 pl-10 pr-4 text-sm text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
          />
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-on-surface-variant">
          Nenhum utilizador encontrado.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl">
          <div className="grid grid-cols-12 bg-surface-container px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
            <div className="col-span-5">Utilizador</div>
            <div className="col-span-4">Instituição</div>
            <div className="col-span-1">Função</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>
          <ul>
            {filtered.map((p) => {
              const isAdmin = adminSet.has(p.id);
              const isSelf = user?.id === p.id;
              const initials =
                (p.full_name || p.email)
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((s) => s[0]?.toUpperCase())
                  .join("") || "?";
              return (
                <li
                  key={p.id}
                  className="grid grid-cols-12 items-center gap-3 px-5 py-4 text-sm transition-colors hover:bg-surface-container-high"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-container font-display text-xs font-bold text-on-tertiary-container">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-on-surface">
                        {p.full_name || "(sem nome)"}
                        {isSelf && (
                          <span className="ml-2 rounded-full bg-primary-container px-2 py-0.5 text-[0.6875rem] font-medium text-on-primary-container">
                            você
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant">{p.email}</p>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <p className="truncate text-on-surface">{p.institution ?? "—"}</p>
                    <p className="truncate text-xs text-on-surface-variant">
                      {p.position ?? "Investigador"}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <StatusChip tone={isAdmin ? "primary" : "neutral"} dot>
                      {isAdmin ? "Admin" : "Inv."}
                    </StatusChip>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    {isAdmin ? (
                      <button
                        onClick={() => {
                          if (isSelf) {
                            toast.error("Não pode remover as suas próprias permissões.");
                            return;
                          }
                          if (confirm(`Remover permissões de administrador a ${p.full_name || p.email}?`)) {
                            demoteMut.mutate(p.id);
                          }
                        }}
                        disabled={demoteMut.isPending || isSelf}
                        className="inline-flex items-center gap-1.5 rounded-md bg-error-container/70 px-3 py-1.5 text-xs font-semibold text-on-error-container transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        <ShieldOff className="h-3.5 w-3.5" />
                        Remover
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm(`Promover ${p.full_name || p.email} a administrador?`)) {
                            promoteMut.mutate(p.id);
                          }
                        }}
                        disabled={promoteMut.isPending}
                        className="inline-flex items-center gap-1.5 rounded-md bg-success-container px-3 py-1.5 text-xs font-semibold text-on-success-container transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Promover
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// silence unused warning for `useEffect` reservation if it's tree-shaken
void useEffect;
