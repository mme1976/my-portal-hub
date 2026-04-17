import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Filter, Search, Microscope, Cpu, Rocket, Radio, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";

export const Route = createFileRoute("/agendamentos")({
  component: AgendamentosPage,
  head: () => ({ meta: [{ title: "Agendamentos · DGEEC SafeCenter" }] }),
});

const filtros = ["Todos os Postos", "Posto A-1", "Posto A-2", "Laboratório Centurion", "Nodo Vortex", "Ala Delta", "Ponto Echo"];

const postos = [
  {
    nome: "Laboratório Centurion — Posto 01",
    estado: "Disponível Agora",
    tone: "success" as const,
    horario: "10h00 – 12h00",
    capacidade: "4 Pessoas",
    icon: Microscope,
    actionable: true,
  },
  {
    nome: "Nodo Vortex — Posto 04",
    estado: "Abre 25 Out",
    tone: "secondary" as const,
    horario: "14h00 – 17h00",
    capacidade: "12 Pessoas",
    icon: Cpu,
    actionable: true,
  },
  {
    nome: "Ala Delta — Posto 02",
    estado: "Disponível Agora",
    tone: "success" as const,
    horario: "09h30 – 11h30",
    capacidade: "2 Pessoas",
    icon: Rocket,
    actionable: true,
  },
  {
    nome: "Ponto Echo — Posto 06",
    estado: "Indisponível",
    tone: "error" as const,
    horario: "N/A",
    capacidade: "8 Pessoas",
    icon: Radio,
    actionable: false,
  },
];

function AgendamentosPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label-eyebrow">Gestão de Postos</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-on-surface">
              Pesquisar Disponibilidade
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-md bg-surface-container-highest px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high">
              <Filter className="h-4 w-4" />
              Limpar Filtros
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-tonal hover:shadow-tonal-lg">
              <Search className="h-4 w-4" />
              Aplicar Pesquisa
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar filtros */}
          <aside className="space-y-6">
            <div>
              <p className="label-eyebrow">Intervalo de Datas</p>
              <div className="mt-3 space-y-2">
                {["24 Out, 2023", "31 Out, 2023"].map((d) => (
                  <div
                    key={d}
                    className="flex items-center gap-3 rounded-lg bg-surface-container-lowest px-4 py-3 text-sm text-on-surface shadow-tonal-sm"
                  >
                    <Calendar className="h-4 w-4 text-on-surface-variant" />
                    {d}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="label-eyebrow">Restrições de Horário</p>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                <input
                  defaultValue="09h30"
                  className="rounded-lg bg-surface-container-lowest px-3 py-2.5 text-center text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
                />
                <span className="text-on-surface-variant">até</span>
                <input
                  defaultValue="17h00"
                  className="rounded-lg bg-surface-container-lowest px-3 py-2.5 text-center text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
                />
              </div>
            </div>

            <div>
              <p className="label-eyebrow">Tipo de Posto</p>
              <div className="mt-3 space-y-2">
                {[
                  { l: "Posto Padrão", on: true },
                  { l: "Hub de Alta Densidade", on: false },
                  { l: "Sala de Computação Quântica", on: false },
                ].map((o) => (
                  <label
                    key={o.l}
                    className="flex items-center gap-3 rounded-lg bg-surface-container-lowest px-4 py-3 text-sm text-on-surface shadow-tonal-sm"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={o.on}
                      className="h-4 w-4 rounded accent-[var(--primary)]"
                    />
                    {o.l}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <div>
            <div className="flex flex-wrap gap-2">
              {filtros.map((f, i) => (
                <button
                  key={f}
                  className={
                    i === 0
                      ? "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-tonal-sm"
                      : "rounded-full bg-primary-container/50 px-4 py-2 text-xs font-medium text-on-primary-container hover:bg-primary-container"
                  }
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {postos.map((p) => {
                const Icon = p.icon;
                return (
                  <article
                    key={p.nome}
                    className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm"
                  >
                    <span
                      className={`absolute left-0 top-0 h-full w-1 ${
                        p.actionable ? "bg-gradient-primary" : "bg-error/40"
                      }`}
                    />
                    <div className="flex items-start justify-between">
                      <h3 className="max-w-[70%] font-display text-xl font-bold text-on-surface">
                        {p.nome}
                      </h3>
                      <Icon className="h-5 w-5 text-on-surface-variant" />
                    </div>
                    <div className="mt-3">
                      <StatusChip tone={p.tone} dot>
                        {p.estado}
                      </StatusChip>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <p className="label-eyebrow">Horário</p>
                        <p className="num-display mt-1 text-base font-bold text-on-surface">
                          {p.horario}
                        </p>
                      </div>
                      <div>
                        <p className="label-eyebrow">Capacidade</p>
                        <p className="num-display mt-1 text-base font-bold text-on-surface">
                          {p.capacidade}
                        </p>
                      </div>
                    </div>
                    {p.actionable ? (
                      <Link
                        to="/agendamentos/reservar"
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-tonal hover:shadow-tonal-lg"
                      >
                        Reservar Agora <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="mt-6 w-full cursor-not-allowed rounded-md bg-surface-container-highest px-5 py-3 text-sm font-semibold text-on-surface-variant"
                      >
                        Em Manutenção
                      </button>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Vista Semanal */}
            <section className="mt-8 rounded-2xl bg-surface-container-low p-6">
              <header className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-on-surface">
                  Vista Semanal: 23 Out — 29 Out
                </h3>
                <div className="flex gap-1">
                  <button className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-highest">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-highest">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </header>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map((d, i) => {
                  const day = 23 + i;
                  const isToday = i === 1;
                  const dot = i === 0 || i === 1 || i === 2 || i === 4;
                  return (
                    <div
                      key={d}
                      className={
                        isToday
                          ? "rounded-xl bg-primary-container p-3 text-center"
                          : "rounded-xl bg-surface-container-lowest p-3 text-center"
                      }
                    >
                      <p className="label-eyebrow">{d}</p>
                      <p
                        className={
                          isToday
                            ? "num-display mt-1 text-xl font-bold text-primary"
                            : "num-display mt-1 text-xl font-bold text-on-surface"
                        }
                      >
                        {day}
                      </p>
                      {dot && (
                        <span className="mx-auto mt-1 block h-1 w-1 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
