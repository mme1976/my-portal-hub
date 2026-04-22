import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Cpu, Lock, Check, ShieldCheck, Loader2 } from "lucide-react";
import { addDays, format, startOfWeek } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/_authenticated/agendamentos_/reservar")({
  component: ReservarPage,
  head: () => ({ meta: [{ title: "Reservar Posto · DGEEC SafeCenter" }] }),
});

interface Posto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  available: boolean;
}

const slots = [
  { id: "09:30", from: "09h30", to: "10h30", start: "09:30", end: "10:30" },
  { id: "10:30", from: "10h30", to: "11h30", start: "10:30", end: "11:30" },
  { id: "11:30", from: "11h30", to: "12h30", start: "11:30", end: "12:30" },
  { id: "12:30", from: "12h30", to: "13h30", start: "12:30", end: "13:30" },
  { id: "13:30", from: "13h30", to: "14h30", start: "13:30", end: "14:30" },
  { id: "14:30", from: "14h30", to: "15h30", start: "14:30", end: "15:30" },
  { id: "15:30", from: "15h30", to: "16h30", start: "15:30", end: "16:30" },
  { id: "16:30", from: "16h30", to: "17h30", start: "16:30", end: "17:30" },
];

function ReservarPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [postos, setPostos] = useState<Posto[]>([]);
  const [selectedPosto, setSelectedPosto] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [busySlots, setBusySlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load postos
  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("postos")
        .select("id, code, name, description, available")
        .order("code");
      if (error) {
        toast.error("Não foi possível carregar postos");
      } else {
        setPostos(data ?? []);
        const firstAvail = data?.find((p) => p.available);
        if (firstAvail) setSelectedPosto(firstAvail.id);
      }
      setLoading(false);
    })();
  }, []);

  // Load busy slots whenever posto/date changes
  useEffect(() => {
    if (!selectedPosto) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    void (async () => {
      const { data, error } = await supabase
        .from("reservas")
        .select("start_time, end_time, status")
        .eq("posto_id", selectedPosto)
        .eq("reserva_date", dateStr)
        .neq("status", "cancelada");
      if (error) return;
      const busy = new Set<string>();
      (data ?? []).forEach((r) => {
        slots.forEach((s) => {
          // mark slot busy if it overlaps any reserva
          if (s.start < r.end_time.slice(0, 5) && s.end > r.start_time.slice(0, 5)) {
            busy.add(s.id);
          }
        });
      });
      setBusySlots(busy);
      setSelectedSlots((prev) => prev.filter((id) => !busy.has(id)));
    })();
  }, [selectedPosto, selectedDate]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const toggleSlot = (id: string) => {
    if (busySlots.has(id)) return;
    setSelectedSlots((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectedPostoData = postos.find((p) => p.id === selectedPosto);

  const handleConfirm = async () => {
    if (!user || !selectedPosto || selectedSlots.length === 0) {
      toast.error("Selecione posto, data e pelo menos um bloco horário");
      return;
    }
    setSubmitting(true);

    // Group consecutive slots into single reservas
    const sorted = [...selectedSlots].sort();
    const groups: { start: string; end: string }[] = [];
    let currentStart = slots.find((s) => s.id === sorted[0])!.start;
    let currentEnd = slots.find((s) => s.id === sorted[0])!.end;

    for (let i = 1; i < sorted.length; i++) {
      const slot = slots.find((s) => s.id === sorted[i])!;
      if (slot.start === currentEnd) {
        currentEnd = slot.end;
      } else {
        groups.push({ start: currentStart, end: currentEnd });
        currentStart = slot.start;
        currentEnd = slot.end;
      }
    }
    groups.push({ start: currentStart, end: currentEnd });

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const inserts = groups.map((g) => ({
      posto_id: selectedPosto,
      user_id: user.id,
      reserva_date: dateStr,
      start_time: g.start,
      end_time: g.end,
    }));

    const { data: created, error } = await supabase
      .from("reservas")
      .insert(inserts)
      .select("id, start_time, end_time, reserva_date");

    if (error) {
      // 23P01 = exclusion violation (overlap)
      if (error.code === "23P01" || error.message.toLowerCase().includes("overlap")) {
        toast.error("Conflito de horário: outro investigador já reservou este intervalo. Atualize e tente novamente.");
      } else {
        toast.error(`Erro ao criar reserva: ${error.message}`);
      }
      setSubmitting(false);
      return;
    }

    toast.success(`Reserva confirmada — ${groups.length} bloco(s) no ${selectedPostoData?.name}`);

    // Fire-and-forget confirmation email (won't block UX if not yet configured)
    void fetch("/lovable/email/transactional/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({
        templateName: "reserva-confirmada",
        recipientEmail: user.email,
        idempotencyKey: `reserva-${created?.[0]?.id}`,
        templateData: {
          name: profile?.full_name || user.email?.split("@")[0],
          postoName: selectedPostoData?.name,
          date: format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: pt }),
          slots: groups.map((g) => `${g.start.slice(0, 5)}–${g.end.slice(0, 5)}`).join(", "),
        },
      }),
    }).catch(() => {
      /* email is best-effort */
    });

    setSubmitting(false);
    void navigate({ to: "/dashboard" });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

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
            Selecione um posto disponível e o seu bloco de tempo preferido. As reservas
            são validadas em tempo real contra conflitos de horário.
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
                const sel = selectedPosto === p.id;
                if (!p.available) {
                  return (
                    <div key={p.id} className="rounded-2xl bg-primary-container/40 p-5 opacity-60">
                      <p className="label-eyebrow">Posto</p>
                      <p className="num-display mt-1 text-3xl font-extrabold text-on-surface">{p.code}</p>
                      <p className="mt-6 flex items-center gap-2 text-xs text-on-surface-variant">
                        <Lock className="h-3 w-3" /> Indisponível
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
                    <p className={sel ? "label-eyebrow !text-on-primary/80" : "label-eyebrow"}>Posto</p>
                    <p className={sel ? "num-display mt-1 text-3xl font-extrabold" : "num-display mt-1 text-3xl font-extrabold text-on-surface"}>
                      {p.code}
                    </p>
                    <p className={sel ? "mt-6 flex items-center gap-2 text-xs" : "mt-6 flex items-center gap-2 text-xs text-on-surface-variant"}>
                      <Cpu className="h-3.5 w-3.5" />
                      {p.description ?? p.name}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Date picker */}
            <div className="mt-8 rounded-2xl bg-surface-container-low p-6">
              <header className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-on-surface">2. Escolher Data</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setWeekStart((w) => addDays(w, -7))}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-container-highest"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setWeekStart((w) => addDays(w, 7))}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-container-highest"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </header>
              <div className="mt-5 grid grid-cols-7 gap-2 text-center">
                {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((d) => (
                  <p key={d} className="label-eyebrow">{d}</p>
                ))}
                {weekDays.map((d) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const past = d < today;
                  const isToday = d.toDateString() === new Date().toDateString();
                  const sel = selectedDate.toDateString() === d.toDateString() && !past;
                  return (
                    <button
                      key={d.toISOString()}
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
                      <span className="block num-display text-base font-bold">{d.getDate()}</span>
                      {isToday && (
                        <span className={sel ? "label-eyebrow !text-on-primary/80" : "label-eyebrow"}>Hoje</span>
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
                  const busy = busySlots.has(s.id);
                  const sel = selectedSlots.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSlot(s.id)}
                      disabled={busy}
                      className={
                        busy
                          ? "rounded-xl bg-surface-container-highest/60 p-3 text-center text-on-surface-variant/60"
                          : sel
                          ? "rounded-xl bg-gradient-primary p-3 text-center text-on-primary shadow-tonal-sm"
                          : "rounded-xl bg-surface-container-lowest p-3 text-center text-on-surface hover:bg-surface-container-high"
                      }
                    >
                      <p className="num-display text-sm font-bold">{s.from}</p>
                      <p className="text-[0.65rem] opacity-70">—</p>
                      <p className="num-display text-sm font-bold">{s.to}</p>
                      {busy && <p className="label-eyebrow mt-1 !text-[0.6rem]">Ocupado</p>}
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
                  <span className="text-right font-semibold text-primary">0,00 € (Coberto por Bolsa)</span>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={submitting || selectedSlots.length === 0 || !selectedPosto}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-primary py-3.5 font-display text-sm font-bold text-on-primary shadow-tonal hover:shadow-tonal-lg disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
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
                  Receberá um email de confirmação com os detalhes da reserva.
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
