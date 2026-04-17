import { createFileRoute } from "@tanstack/react-router";
import { Clock, Database, Zap, Terminal } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/analises")({
  component: AnalisesPage,
  head: () => ({ meta: [{ title: "Análises · DGEEC SafeCenter" }] }),
});

function AnalisesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <p className="label-eyebrow">Resumo da Atividade</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-on-surface">
          Painel do Investigador
        </h1>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <KPI icon={Clock} eyebrow="Mês Atual" label="Tempo Total Utilizado" value="124h 45m" pct={62} />
          <KPI icon={Database} eyebrow="Histórico" label="Datasets Acedidos" value="18 Ativos" tags={["Microdados", "Censos"]} />
          <KPI icon={Zap} eyebrow="Performance" label="Eficiência de Sessão" value="94.2%" trend="+2.4% em relação à última semana" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl bg-surface-container-low p-6">
            <h3 className="font-display text-lg font-bold text-on-surface">
              Distribuição de Tempo por Projeto (últimos 30 dias)
            </h3>
            <div className="mt-6 space-y-5">
              {[
                { p: "Censos 2021 — Análise Geoespacial", h: "48h 12m", pct: 78 },
                { p: "RAIDES — Modelação Logística", h: "32h 05m", pct: 56 },
                { p: "Inquérito Emprego — Painel Q4", h: "24h 38m", pct: 42 },
                { p: "Habitação Metropolitana", h: "19h 50m", pct: 32 },
              ].map((row) => (
                <div key={row.p}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-on-surface">{row.p}</span>
                    <span className="num-display text-on-surface-variant">{row.h}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-surface-container-highest">
                    <div
                      className="h-full rounded-full bg-gradient-primary"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.04_245)] to-[oklch(0.13_0.03_245)] p-6 text-on-primary">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Terminal className="h-4 w-4" />
              Sessão de Investigação Ativa
            </div>
            <p className="mt-3 text-sm leading-relaxed opacity-85">
              O terminal 04-B está atualmente a processar os modelos de regressão para o dataset
              Censos 2021.
            </p>
            <div className="mt-8 flex items-end justify-between">
              <div>
                <p className="text-[0.6875rem] uppercase tracking-[0.1em] opacity-70">Tempo decorrido</p>
                <p className="num-display mt-1 text-4xl font-extrabold tabular-nums">01:42:15</p>
              </div>
              <button className="rounded-md bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25">
                Ver Terminal
              </button>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function KPI({
  icon: Icon,
  eyebrow,
  label,
  value,
  pct,
  tags,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  label: string;
  value: string;
  pct?: number;
  tags?: string[];
  trend?: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <Icon className="h-5 w-5" />
        </div>
        <span className="label-eyebrow">{eyebrow}</span>
      </div>
      <p className="mt-5 text-sm font-medium text-on-surface-variant">{label}</p>
      <p className="num-display mt-1 text-3xl font-extrabold text-on-surface">{value}</p>
      {pct !== undefined && (
        <div className="mt-4 h-2 w-full rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-gradient-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {tags && (
        <div className="mt-4 flex gap-2">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-surface-container-highest px-3 py-1 text-xs text-on-surface-variant">
              {t}
            </span>
          ))}
        </div>
      )}
      {trend && <p className="mt-4 text-xs text-primary">{trend}</p>}
    </div>
  );
}
