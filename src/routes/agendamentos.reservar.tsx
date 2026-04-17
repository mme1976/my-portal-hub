import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Cpu, Microscope, Lock, Check, Atom, Terminal, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/agendamentos/reservar")({
  component: ReservarPage,
  head: () => ({ meta: [{ title: "Reservar Posto · DGEEC SafeCenter" }] }),
});

const postos = [
  { id: "01", label: "Pronto para reserva", icon: Check, available: true },
  { id: "02", label: "Configuração Base", icon: Cpu, available: true },
  { id: "03", label: "Ocupado", icon: Lock, available: false },
  { id: "04", label: "Unidade de Espetroscopia", icon: Atom, available: true },
  { id: "05", label: "Configuração Base", icon: Cpu, available: true },
  { id: "06", label: "Terminal HPC", icon: Terminal, available: true },
];

const slots = [
  { id: "09:30", from: "09h30", to: "10h30" },
  { id: "10:30", from: "10h30", to: "11h30" },
  { id: "11:30", from: "11h30", to: "12h30" },
  { id: "12:30", from: "12h30", to: "13h30" },
  { id: "13:30", from: "13h30", to: "14h30" },
  { id: "14:30", from: "14h30", to: "15h30", busy: true },
  { id: "15:30", from: "15h30", to: "16h30" },
  { id: "16:30", from: "16h30", to: "17h00" },
];

function ReservarPage() {
  const [selectedPosto, setSelectedPosto] = useState("01");
  const [selectedDate, setSelectedDate] = useState(2);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(["11:30", "12:30"]);

  const toggleSlot = (id: string, busy?: boolean) => {
    if (busy) return;
    setSelectedSlots((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <Link
          to="/agendamentos"
          className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à pesquisa
        </Link>

        <div className="mt-4">
          <p className="label-eyebrow">Gestão do Espaço de Trabalho</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-on-surface">
            Reserve o seu posto de trabalho.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            Selecione um posto de laboratório disponível e o seu bloco de tempo preferido para um
            trabalho sem interrupções. Todos os postos incluem acesso a clusters computacionais de
            alta velocidade.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left */}
          <div>
            <Section
              step="1"
              title="Selecionar Posto"
              right={
                <div className="flex gap-4 text-xs">
                  <Legend color="bg-surface-container-highest" label="Disponível" />
                  <Legend color="bg-primary" label="Selecionado" />
                  <Legend color="bg-primary-container/60" label="Ocupado" />
                </div>
              }
            />

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              {postos.map((p) => {
                const Icon = p.icon;
                const sel = selectedPosto === p.id;
                if (!p.available) {
                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl bg-primary-container/40 p-5 opacity-60"
                    >
                      <p className="label-eyebrow">Posto</p>
                      <p className="num-display mt-1 text-3xl font-extrabold text-on-surface">
                        {p.id}
                      </p>
                      <p className="mt-6 flex items-center gap-2 text-xs text-on-surface-variant">
                        <Lock className="h-3 w-3" /> Ocupado
                      </p>
                    </div>
                  );
                }
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPosto(p.id)}
                    className={
                      sel
                        ? "rounded-2xl bg-gradient-primary p-5 text-on-primary shadow-tonal ring-2 ring-primary/30 ring-offset-2 ring-offset-background text-left"
                        : "rounded-2xl bg-surface-container-lowest p-5 shadow-tonal-sm transition-all hover:shadow-tonal text-left"
                    }
                  >
                    <p
                      className={
                        sel
                          ? "label-eyebrow !text-on-primary/80"
                          : "label-eyebrow"
                      }
                    >
                      Posto
                    </p>
                    <p
                      className={
                        sel
                          ? "num-display mt-1 text-3xl font-extrabold"
                          : "num-display mt-1 text-3xl font-extrabold text-on-surface"
                      }
                    >
                      {p.id}
                    </p>
                    <p
                      className={
                        sel
                          ? "mt-6 flex items-center gap-2 text-xs"
                          : "mt-6 flex items-center gap-2 text-xs text-on-surface-variant"
                      }
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {p.label}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Date picker */}
            <div className="mt-8 rounded-2xl bg-surface-container-low p-6">
              <header className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-on-surface">
                  2. Escolher Data
                </h3>
                <div className="flex gap-1">
                  <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-container-highest">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-container-highest">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </header>
              <div className="mt-5 grid grid-cols-7 gap-2 text-center">
                {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((d) => (
                  <p key={d} className="label-eyebrow">{d}</p>
                ))}
                {[26, 27, 28, 1, 2, 3, 4].map((d, i) => {
                  const past = i < 3;
                  const sel = selectedDate === d && !past;
                  const isToday = d === 2;
                  return (
                    <button
                      key={i}
                      onClick={() => !past && setSelectedDate(d)}
                      disabled={past}
                      className={
                        sel
                          ? "rounded-xl bg-primary py-3 font-display text-on-primary shadow-tonal-sm"
                          : past
                          ? "py-3 text-on-surface-variant/50"
                          : "rounded-xl bg-surface-container-lowest py-3 font-display text-on-surface hover:bg-surface-container-highest"
                      }
                    >
                      <span className="block num-display text-base font-bold">{d}</span>
                      {isToday && (
                        <span
                          className={
                            sel
                              ? "label-eyebrow !text-on-primary/80"
                              : "label-eyebrow"
                          }
                        >
                          Hoje
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Time slots */}
          <div>
            <Section step="3" title="Bloco de Horário" />
            <div className="mt-5 rounded-2xl bg-surface-container-low p-6">
              <div className="grid grid-cols-2 gap-3">
                {slots.map((s) => {
                  const sel = selectedSlots.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSlot(s.id, s.busy)}
                      disabled={s.busy}
                      className={
                        s.busy
                          ? "rounded-xl bg-surface-container-highest/60 p-3 text-center text-on-surface-variant/60"
                          : sel
                          ? "rounded-xl bg-gradient-primary p-3 text-center text-on-primary shadow-tonal-sm"
                          : "rounded-xl bg-surface-container-lowest p-3 text-center text-on-surface hover:bg-surface-container-high"
                      }
                    >
                      <p className="num-display text-sm font-bold">{s.from}</p>
                      <p className="text-[0.65rem] opacity-70">—</p>
                      <p className="num-display text-sm font-bold">{s.to}</p>
                      {s.busy && (
                        <p className="label-eyebrow mt-1 !text-[0.6rem]">Ocupado</p>
                      )}
                      {sel && <Check className="mx-auto mt-1 h-3 w-3" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3 border-t border-outline-variant/15 pt-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Duração Total:</span>
                  <span className="num-display font-bold text-on-surface">
                    {selectedSlots.length},0 Horas
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-on-surface-variant">Taxa de Reserva:</span>
                  <span className="text-right font-semibold text-primary">
                    0,00 € (Coberto por Bolsa)
                  </span>
                </div>
              </div>

              <button className="mt-5 w-full rounded-md bg-gradient-primary py-3.5 font-display text-sm font-bold text-on-primary shadow-tonal hover:shadow-tonal-lg">
                Confirmar Agendamento
              </button>
              <p className="mt-3 text-center text-[0.6875rem] italic text-on-surface-variant">
                Os agendamentos podem ser cancelados até 2 horas antes do início sem penalização.
              </p>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-primary-container/50 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-on-primary-container" />
              <div>
                <p className="label-eyebrow">Aviso Institucional</p>
                <p className="mt-1 text-sm text-on-primary-container">
                  As suas credenciais permitem acesso prioritário aos Postos 01 e 06.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Section({
  step,
  title,
  right,
}: {
  step: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <h2 className="font-display text-xl font-bold text-on-surface">
        {step}. {title}
      </h2>
      {right}
    </header>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
