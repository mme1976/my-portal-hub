import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Filter, Search, Eye, Download, Pencil, Clock, FolderCog, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Painel · DGEEC SafeCenter" }] }),
});

const pedidos = [
  {
    ref: "#REQ-2024-089",
    dataset: "Estatísticas do Ensino Superior",
    sub: "Coorte 2020–2023",
    data: "12 Mai 2024",
    state: "Em Preparação",
    tone: "secondary" as const,
    icon: Eye,
  },
  {
    ref: "#REQ-2024-072",
    dataset: "Censos da Habitação — Área Metropolitana",
    sub: "Microdados Harmonizados",
    data: "04 Mai 2024",
    state: "Pronto",
    tone: "success" as const,
    icon: Download,
  },
  {
    ref: "#REQ-2024-102",
    dataset: "Mobilidade Pendular Nacional",
    sub: "Dados GEO-Ref v2",
    data: "22 Mai 2024",
    state: "Pendente",
    tone: "warning" as const,
    icon: Pencil,
  },
];

function Dashboard() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label-eyebrow">Dashboard de Investigação</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-on-surface">
              Bem-vindo, Dr. Almeida
            </h1>
          </div>
          <Link
            to="/pedidos/novo"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-tonal transition-all hover:shadow-tonal-lg"
          >
            <Plus className="h-4 w-4" />
            Novo Pedido de Dataset
          </Link>
        </div>

        {/* KPIs */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <KPI
            icon={Clock}
            label="Horas de Utilização"
            value="142.5h"
            chip="+12% vs mês anterior"
            tone="primary"
          />
          <KPI icon={FolderCog} label="Datasets Ativos" value="08" tone="tertiary" />
          <KPI icon={BarChart3} label="Projetos em Curso" value="03" tone="primary" highlight>
            <Link to="/datasets" className="text-xs font-semibold text-on-primary hover:underline">
              Ver todos os projetos →
            </Link>
          </KPI>
        </div>

        {/* Tabela */}
        <section className="mt-10 rounded-3xl bg-surface-container-low p-8">
          <header className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-on-surface">
              Estado dos Pedidos de Datasets
            </h2>
            <div className="flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-highest">
                <Filter className="h-4 w-4" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-highest">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="mt-6 overflow-hidden rounded-2xl">
            <div className="grid grid-cols-12 bg-surface-container px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
              <div className="col-span-3">Referência</div>
              <div className="col-span-4">Dataset</div>
              <div className="col-span-2">Data do Pedido</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>
            <ul>
              {pedidos.map((p) => {
                const Icon = p.icon;
                return (
                  <li
                    key={p.ref}
                    className="grid grid-cols-12 items-center gap-3 px-5 py-5 text-sm transition-colors hover:bg-surface-container-high"
                  >
                    <div className="col-span-3 font-mono text-on-surface-variant">{p.ref}</div>
                    <div className="col-span-4">
                      <p className="font-semibold text-on-surface">{p.dataset}</p>
                      <p className="text-xs text-on-surface-variant">{p.sub}</p>
                    </div>
                    <div className="col-span-2 text-on-surface-variant">{p.data}</div>
                    <div className="col-span-2">
                      <StatusChip tone={p.tone} dot>
                        {p.state}
                      </StatusChip>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-container text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary">
                        <Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Bottom strip */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.04_245)] to-[oklch(0.13_0.03_245)] p-8 text-on-primary">
            <p className="label-eyebrow !text-on-primary/70">Recurso Recomendado</p>
            <h3 className="mt-2 font-display text-2xl font-extrabold">
              Guia de Segurança de Dados
            </h3>
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
