import { createFileRoute } from "@tanstack/react-router";
import { Plus, FolderCog, FlaskConical, Wrench, Cpu, Radio, Network, Microscope, Check, X, MoreVertical } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";

export const Route = createFileRoute("/administracao")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Administração · DGEEC SafeCenter" }] }),
});

const pedidos = [
  { i: "EW", n: "Dr. Elena Wagner", lab: "Lab. Bio Molecular", posto: "Posto Alfa", h: "Amanhã, 09:00 - 13:00", state: "Pendente", tone: "warning" as const, actions: true },
  { i: "MK", n: "Marcus Kane", lab: "Unid. Computação Quântica", posto: "Posto Delta", h: "24 Out, 14:00 - 18:00", state: "Verificado", tone: "secondary" as const, actions: false },
  { i: "SL", n: "Sarah Lopez", lab: "Depto. Astrofísica", posto: "Posto Gama", h: "25 Out, 08:00 - 12:00", state: "Pendente", tone: "warning" as const, actions: true },
];

const postosGerir = [
  { n: "Posto Alfa", state: "Disponível", tone: "success", on: true, icon: FlaskConical },
  { n: "Posto Beta", state: "Disponível", tone: "success", on: true, icon: Microscope },
  { n: "Posto Gama", state: "Manutenção", tone: "error", on: false, icon: Wrench },
  { n: "Posto Delta", state: "Disponível", tone: "success", on: true, icon: Cpu },
  { n: "Posto Épsilon", state: "Disponível", tone: "success", on: true, icon: Radio },
  { n: "Posto Zeta", state: "Disponível", tone: "success", on: true, icon: Network },
];

function AdminPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label-eyebrow">Gestão Institucional</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-on-surface">
              Visão Geral do Sistema
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">
              Telemetria em tempo real e controlos de gestão para o DGEEC SafeCenter.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-tonal hover:shadow-tonal-lg">
            <Plus className="h-4 w-4" /> Novo Protocolo
          </button>
        </div>

        {/* KPIs */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Stat label="Total de Agendamentos" value="1,284" chip="↑ 12%" tone="default" />
          <Stat label="Investigadores Ativos" value="42" chip="Ativos" tone="default" />
          <Stat label="Utilização" value="92%" chip="Ótima" tone="primary" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl bg-surface-container-low p-8">
            <header className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-on-surface">
                Próximos Pedidos de Agendamento
              </h2>
              <a className="text-xs font-semibold text-primary hover:underline" href="#">
                Ver Todos →
              </a>
            </header>
            <div className="mt-5 overflow-hidden rounded-2xl">
              <div className="grid grid-cols-12 bg-surface-container px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                <div className="col-span-4">Investigador</div>
                <div className="col-span-4">Posto / Horário</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-2 text-right">Ações</div>
              </div>
              <ul>
                {pedidos.map((p) => (
                  <li
                    key={p.n}
                    className="grid grid-cols-12 items-center gap-3 px-5 py-5 text-sm transition-colors hover:bg-surface-container-high"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-container font-display text-xs font-bold text-on-tertiary-container">
                        {p.i}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">{p.n}</p>
                        <p className="text-xs text-on-surface-variant">{p.lab}</p>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <p className="font-semibold text-on-surface">{p.posto}</p>
                      <p className="text-xs text-on-surface-variant">{p.h}</p>
                    </div>
                    <div className="col-span-2">
                      <StatusChip tone={p.tone} dot>
                        {p.state}
                      </StatusChip>
                    </div>
                    <div className="col-span-2 flex justify-end gap-1">
                      {p.actions ? (
                        <>
                          <button className="flex h-9 w-9 items-center justify-center rounded-md bg-success-container text-on-success-container hover:opacity-90">
                            <Check className="h-4 w-4" />
                          </button>
                          <button className="flex h-9 w-9 items-center justify-center rounded-md bg-error-container/70 text-on-error-container hover:opacity-90">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button className="flex h-9 w-9 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-highest">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <aside className="rounded-3xl bg-surface-container-low p-6">
            <header className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-on-surface">Gerir Postos</h3>
              <FolderCog className="h-5 w-5 text-on-surface-variant" />
            </header>
            <ul className="mt-5 space-y-3">
              {postosGerir.map((p) => {
                const Icon = p.icon;
                const color =
                  p.tone === "success" ? "bg-success" : p.tone === "error" ? "bg-error" : "bg-surface-container-highest";
                return (
                  <li
                    key={p.n}
                    className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-4 pl-5 shadow-tonal-sm"
                  >
                    <span className={`absolute left-0 top-0 h-full w-1 ${color}`} />
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-on-surface">{p.n}</p>
                        <p className="label-eyebrow !text-[0.625rem]">{p.state}</p>
                      </div>
                      <Toggle on={p.on} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>

        {/* Banner */}
        <section className="mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(0.18_0.04_245)] to-[oklch(0.13_0.03_245)] p-10 text-on-primary">
          <p className="label-eyebrow !text-on-primary/70">Protocolo 9.4 ativo</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold">
            Otimização do fluxo de dados para a Investigação do Cluster Quântico Q4.
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-md bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/25">
              Rever Estatísticas do Cluster
            </button>
            <button className="rounded-md bg-surface-container-lowest px-5 py-2.5 text-sm font-semibold text-on-surface hover:opacity-90">
              Descarregar Registo
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  chip,
  tone,
}: {
  label: string;
  value: string;
  chip: string;
  tone: "default" | "primary";
}) {
  if (tone === "primary") {
    return (
      <div className="rounded-2xl bg-gradient-primary p-6 text-on-primary shadow-tonal">
        <div className="flex items-center justify-between">
          <p className="label-eyebrow !text-on-primary/80">{label}</p>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[0.6875rem] font-semibold backdrop-blur">
            {chip}
          </span>
        </div>
        <p className="num-display mt-4 text-5xl font-extrabold">{value}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm">
      <div className="flex items-center justify-between">
        <p className="label-eyebrow">{label}</p>
        <span className="rounded-full bg-success-container/60 px-2.5 py-1 text-[0.6875rem] font-semibold text-on-success-container">
          {chip}
        </span>
      </div>
      <p className="num-display mt-4 text-5xl font-extrabold text-on-surface">{value}</p>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={
        on
          ? "relative inline-flex h-5 w-9 flex-none items-center rounded-full bg-primary"
          : "relative inline-flex h-5 w-9 flex-none items-center rounded-full bg-outline-variant/40"
      }
    >
      <span
        className={
          on
            ? "absolute right-0.5 h-4 w-4 rounded-full bg-on-primary shadow"
            : "absolute left-0.5 h-4 w-4 rounded-full bg-surface-container-lowest shadow"
        }
      />
    </span>
  );
}
