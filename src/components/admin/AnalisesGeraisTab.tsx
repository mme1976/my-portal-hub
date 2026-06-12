import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ScrollText, Database, CalendarDays, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Granularidade = "anual" | "mensal";

export function AnalisesGeraisTab() {
  const [gran, setGran] = useState<Granularidade>("anual");
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const protocolosQ = useQuery({
    queryKey: ["analises", "protocolos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protocolos")
        .select("id, estado, data_assinatura, created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const pedidosQ = useQuery({
    queryKey: ["analises", "pedidos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos_dataset")
        .select("id, status, created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const reservasQ = useQuery({
    queryKey: ["analises", "reservas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservas")
        .select("id, reserva_date, status");
      if (error) throw error;
      return data ?? [];
    },
  });

  const isLoading = protocolosQ.isLoading || pedidosQ.isLoading || reservasQ.isLoading;

  const totals = useMemo(() => {
    const protAtivos = (protocolosQ.data ?? []).filter((p) => p.estado === "ativo").length;
    const datasetsApr = (pedidosQ.data ?? []).filter(
      (p) => p.status === "aprovado" || p.status === "concluido",
    ).length;
    const reservasOk = (reservasQ.data ?? []).filter((r) => r.status !== "cancelada").length;
    return { protAtivos, datasetsApr, reservasOk };
  }, [protocolosQ.data, pedidosQ.data, reservasQ.data]);

  const anos = useMemo(() => {
    const s = new Set<number>();
    const add = (d: string | null | undefined) => {
      if (!d) return;
      s.add(new Date(d).getFullYear());
    };
    (protocolosQ.data ?? []).forEach((p) => add(p.data_assinatura || p.created_at));
    (pedidosQ.data ?? []).forEach((p) => add(p.created_at));
    (reservasQ.data ?? []).forEach((r) => add(r.reserva_date));
    s.add(new Date().getFullYear());
    return Array.from(s).sort((a, b) => b - a);
  }, [protocolosQ.data, pedidosQ.data, reservasQ.data]);

  const series = useMemo(() => {
    // Build buckets: either 1 bucket per year (last 6 years) or 12 months for the selected year.
    if (gran === "anual") {
      const currentYear = new Date().getFullYear();
      const years: number[] = [];
      for (let y = currentYear - 5; y <= currentYear; y++) years.push(y);
      const label = (y: number) => String(y);
      const bucketIndex = (d: string | null | undefined) => {
        if (!d) return -1;
        const y = new Date(d).getFullYear();
        return years.indexOf(y);
      };
      return buildSeries(years.length, label, bucketIndex, years);
    }
    const months = Array.from({ length: 12 }, (_, i) => i);
    const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const label = (i: number) => monthLabels[i];
    const bucketIndex = (d: string | null | undefined) => {
      if (!d) return -1;
      const date = new Date(d);
      if (date.getFullYear() !== year) return -1;
      return date.getMonth();
    };
    return buildSeries(months.length, label, bucketIndex, months);

    function buildSeries<T>(
      n: number,
      label: (key: T) => string,
      bucketIndex: (d: string | null | undefined) => number,
      keys: T[],
    ) {
      const protocolos = new Array(n).fill(0);
      const datasets = new Array(n).fill(0);
      const reservas = new Array(n).fill(0);
      (protocolosQ.data ?? []).forEach((p) => {
        const i = bucketIndex(p.data_assinatura || p.created_at);
        if (i >= 0 && p.estado === "ativo") protocolos[i] += 1;
      });
      (pedidosQ.data ?? []).forEach((p) => {
        const i = bucketIndex(p.created_at);
        if (i >= 0) datasets[i] += 1;
      });
      (reservasQ.data ?? []).forEach((r) => {
        const i = bucketIndex(r.reserva_date);
        if (i >= 0 && r.status !== "cancelada") reservas[i] += 1;
      });
      return keys.map((k, i) => ({
        label: label(k),
        protocolos: protocolos[i],
        datasets: datasets[i],
        reservas: reservas[i],
      }));
    }
  }, [gran, year, protocolosQ.data, pedidosQ.data, reservasQ.data]);

  const maxVal = useMemo(
    () => Math.max(1, ...series.flatMap((s) => [s.protocolos, s.datasets, s.reservas])),
    [series],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KPI
          icon={ScrollText}
          label="Protocolos ativos"
          value={totals.protAtivos}
          tone="primary"
        />
        <KPI
          icon={Database}
          label="Datasets aprovados / concluídos"
          value={totals.datasetsApr}
          tone="tertiary"
        />
        <KPI
          icon={CalendarDays}
          label="Reservas (não canceladas)"
          value={totals.reservasOk}
          tone="success"
        />
      </div>

      <div className="rounded-3xl bg-surface-container-low p-6 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label-eyebrow">Atividade agregada</p>
            <h2 className="mt-1 font-display text-xl font-bold text-on-surface">
              Protocolos, datasets e reservas
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Visão {gran === "anual" ? "anual (últimos 6 anos)" : `mensal de ${year}`}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-full bg-surface-container-lowest p-1 shadow-tonal-sm">
              {(["anual", "mensal"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGran(g)}
                  className={
                    gran === g
                      ? "rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-on-primary"
                      : "rounded-full px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface"
                  }
                >
                  {g === "anual" ? "Anual" : "Mensal"}
                </button>
              ))}
            </div>
            {gran === "mensal" && (
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-md bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
              >
                {anos.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-4 text-xs">
          <Legend color="bg-primary" label="Protocolos ativos" />
          <Legend color="bg-tertiary" label="Pedidos de dataset" />
          <Legend color="bg-success" label="Reservas" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <div
              className="flex items-end gap-3 min-w-full"
              style={{ minHeight: "240px" }}
            >
              {series.map((row) => (
                <div key={row.label} className="flex flex-1 min-w-[44px] flex-col items-center">
                  <div
                    className="flex w-full items-end justify-center gap-1"
                    style={{ height: "200px" }}
                  >
                    <Bar value={row.protocolos} max={maxVal} className="bg-primary" />
                    <Bar value={row.datasets} max={maxVal} className="bg-tertiary" />
                    <Bar value={row.reservas} max={maxVal} className="bg-success" />
                  </div>
                  <p className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                    {row.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl">
          <div className="grid grid-cols-4 bg-surface-container px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
            <div>{gran === "anual" ? "Ano" : "Mês"}</div>
            <div className="text-right">Protocolos</div>
            <div className="text-right">Datasets</div>
            <div className="text-right">Reservas</div>
          </div>
          <ul>
            {series.map((row) => (
              <li
                key={row.label}
                className="grid grid-cols-4 items-center px-5 py-3 text-sm hover:bg-surface-container-high"
              >
                <div className="font-semibold text-on-surface">{row.label}</div>
                <div className="num-display text-right text-on-surface">{row.protocolos}</div>
                <div className="num-display text-right text-on-surface">{row.datasets}</div>
                <div className="num-display text-right text-on-surface">{row.reservas}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "primary" | "tertiary" | "success";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-primary-container text-on-primary-container"
      : tone === "tertiary"
        ? "bg-tertiary-container text-on-tertiary-container"
        : "bg-success-container text-on-success-container";
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneCls}`}>
          <Icon className="h-5 w-5" />
        </div>
        <TrendingUp className="h-4 w-4 text-on-surface-variant" />
      </div>
      <p className="mt-5 text-sm font-medium text-on-surface-variant">{label}</p>
      <p className="num-display mt-1 text-3xl font-extrabold text-on-surface">{value}</p>
    </div>
  );
}

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="group relative flex w-3 flex-col items-center justify-end">
      <div
        className={`w-full rounded-t ${className} transition-all`}
        style={{ height: `${pct}%`, minHeight: value > 0 ? "4px" : "0" }}
      />
      <span className="pointer-events-none absolute -top-5 hidden text-[0.625rem] font-semibold text-on-surface group-hover:block">
        {value}
      </span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-on-surface-variant">
      <span className={`inline-block h-3 w-3 rounded ${color}`} />
      {label}
    </div>
  );
}
