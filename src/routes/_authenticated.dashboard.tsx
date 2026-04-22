import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Filter, Search, Eye, Clock, FolderCog, BarChart3, CalendarDays, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Painel · DGEEC SafeCenter" }] }),
});

interface ReservaRow {
  id: string;
  reserva_date: string;
  start_time: string;
  end_time: string;
  status: string;
  posto: { code: string; name: string } | null;
}

function Dashboard() {
  const { user, profile } = useAuth();
  const [reservas, setReservas] = useState<ReservaRow[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(true);

  const loadReservas = async () => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("reservas")
      .select("id, reserva_date, start_time, end_time, status, posto:postos(code, name)")
      .eq("user_id", user.id)
      .gte("reserva_date", today)
      .neq("status", "cancelada")
      .order("reserva_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(20);
    if (error) {
      toast.error("Não foi possível carregar reservas");
    } else {
      setReservas((data ?? []) as unknown as ReservaRow[]);
    }
    setLoadingReservas(false);
  };

  useEffect(() => {
    void loadReservas();
  }, [user?.id]);

  const cancelReserva = async (id: string) => {
    const { error } = await supabase
      .from("reservas")
      .update({ status: "cancelada" })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao cancelar reserva");
      return;
    }
    toast.success("Reserva cancelada");
    void loadReservas();
  };

  // KPIs derived from reservas
  const totalHoras = reservas.reduce((acc, r) => {
    const start = Number(r.start_time.slice(0, 2)) + Number(r.start_time.slice(3, 5)) / 60;
    const end = Number(r.end_time.slice(0, 2)) + Number(r.end_time.slice(3, 5)) / 60;
    return acc + (end - start);
  }, 0);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Investigador";

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label-eyebrow">Dashboard de Investigação</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-on-surface">
              Bem-vindo, {displayName}
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              to="/agendamentos/reservar"
              className="inline-flex items-center gap-2 rounded-md bg-surface-container-highest px-5 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-high"
            >
              <CalendarDays className="h-4 w-4" />
              Reservar Posto
            </Link>
            <Link
              to="/pedidos/novo"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-tonal hover:shadow-tonal-lg"
            >
              <Plus className="h-4 w-4" />
              Novo Pedido
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <KPI
            icon={Clock}
            label="Horas Reservadas"
            value={`${totalHoras.toFixed(1)}h`}
            chip={`${reservas.length} reserva(s)`}
            tone="primary"
          />
          <KPI icon={FolderCog} label="Datasets Ativos" value="08" tone="tertiary" />
          <KPI icon={BarChart3} label="Projetos em Curso" value="03" tone="primary" highlight>
            <Link to="/datasets" className="text-xs font-semibold text-on-primary hover:underline">
              Ver todos os projetos →
            </Link>
          </KPI>
        </div>

        {/* Próximas Reservas */}
        <section className="mt-10 rounded-3xl bg-surface-container-low p-8">
          <header className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-on-surface">
              Próximas Reservas de Postos
            </h2>
            <Link
              to="/agendamentos"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Ver agendamentos →
            </Link>
          </header>

          <div className="mt-6 overflow-hidden rounded-2xl">
            <div className="grid grid-cols-12 bg-surface-container px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
              <div className="col-span-3">Posto</div>
              <div className="col-span-3">Data</div>
              <div className="col-span-3">Horário</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>
            {loadingReservas ? (
              <p className="px-5 py-10 text-center text-sm text-on-surface-variant">A carregar…</p>
            ) : reservas.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-on-surface-variant">Sem reservas futuras.</p>
                <Link
                  to="/agendamentos/reservar"
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-2.5 text-xs font-semibold text-on-primary shadow-tonal"
                >
                  <Plus className="h-3.5 w-3.5" /> Criar primeira reserva
                </Link>
              </div>
            ) : (
              <ul>
                {reservas.map((r) => (
                  <li
                    key={r.id}
                    className="grid grid-cols-12 items-center gap-3 px-5 py-5 text-sm transition-colors hover:bg-surface-container-high"
                  >
                    <div className="col-span-3">
                      <p className="font-semibold text-on-surface">
                        {r.posto?.name ?? "Posto"}
                      </p>
                      <p className="font-mono text-xs text-on-surface-variant">
                        #{r.posto?.code}
                      </p>
                    </div>
                    <div className="col-span-3 text-on-surface-variant">
                      {format(parseISO(r.reserva_date), "d 'de' MMM 'de' yyyy", { locale: pt })}
                    </div>
                    <div className="col-span-3 num-display font-semibold text-on-surface">
                      {r.start_time.slice(0, 5)} – {r.end_time.slice(0, 5)}
                    </div>
                    <div className="col-span-2">
                      <StatusChip tone="success" dot>
                        Confirmada
                      </StatusChip>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => cancelReserva(r.id)}
                        title="Cancelar reserva"
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-error/10 text-error transition-colors hover:bg-error hover:text-on-error"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Bottom strip */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.04_245)] to-[oklch(0.13_0.03_245)] p-8 text-on-primary">
            <p className="label-eyebrow !text-on-primary/70">Recurso Recomendado</p>
            <h3 className="mt-2 font-display text-2xl font-extrabold">Guia de Segurança de Dados</h3>
            <p className="mt-2 text-sm opacity-80">
              Atualização obrigatória sobre protocolos de anonimização.
            </p>
          </div>
          <div className="rounded-2xl bg-surface-container-highest p-8">
            <h3 className="font-display text-xl font-bold text-on-surface">Suporte Técnico</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              A equipa de curadoria está disponível para apoiar a sua investigação.
            </p>
            <button className="mt-5 rounded-md bg-on-surface px-5 py-2.5 text-sm font-semibold text-surface-container-lowest hover:opacity-90">
              Contactar Equipa
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  chip,
  tone = "primary",
  highlight = false,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  chip?: string;
  tone?: "primary" | "tertiary";
  highlight?: boolean;
  children?: React.ReactNode;
}) {
  if (highlight) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-6 text-on-primary shadow-tonal">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="num-display mt-3 text-5xl font-extrabold">{value}</p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    );
  }
  const iconBg =
    tone === "primary"
      ? "bg-primary-container text-on-primary-container"
      : "bg-tertiary-container text-on-tertiary-container";
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        {chip && (
          <span className="rounded-full bg-primary-container/40 px-2.5 py-1 text-[0.6875rem] font-semibold text-primary">
            {chip}
          </span>
        )}
      </div>
      <p className="mt-5 text-sm font-medium text-on-surface-variant">{label}</p>
      <p className="num-display mt-1 text-4xl font-extrabold text-on-surface">{value}</p>
    </div>
  );
}
