import { createFileRoute } from "@tanstack/react-router";
import { Database, Download, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";

export const Route = createFileRoute("/_authenticated/datasets")({
  component: DatasetsPage,
  head: () => ({ meta: [{ title: "Datasets · DGEEC SafeCenter" }] }),
});

const datasets = [
  { id: "DS-2021-CENS", title: "Censos 2021 — Microdados Nível 3", area: "Demografia", state: "Pronto para consulta", tone: "success" as const, size: "12.4 GB" },
  { id: "DS-2023-IE", title: "Inquérito ao Emprego 2023 — Q4", area: "Mercado de Trabalho", state: "Pronto para consulta", tone: "success" as const, size: "3.2 GB" },
  { id: "DS-2024-RNU", title: "Registo Nacional de Utentes (Sintético)", area: "Saúde", state: "Aguardar informação", tone: "warning" as const, size: "—" },
  { id: "DS-2024-MOB", title: "Mobilidade Pendular Nacional 2024", area: "Transportes", state: "Em preparação", tone: "secondary" as const, size: "8.7 GB" },
  { id: "DS-2024-RAIDES", title: "RAIDES — Inscritos no Ensino Superior", area: "Educação", state: "Pronto para consulta", tone: "success" as const, size: "1.9 GB" },
  { id: "DS-2024-PA", title: "Movimento de Passageiros Aéreos 2024", area: "Transportes", state: "Pendente", tone: "neutral" as const, size: "TBD" },
];

function DatasetsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <p className="label-eyebrow">Catálogo Institucional</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-on-surface">
          Datasets Disponíveis
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">
          Conjuntos de microdados certificados pela DGEEC, com anonimização garantida e auditoria
          de acessos.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {datasets.map((d) => (
            <article
              key={d.id}
              className="group rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm transition-shadow hover:shadow-tonal"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                  <Database className="h-5 w-5" />
                </div>
                <StatusChip tone={d.tone} dot>
                  {d.state}
                </StatusChip>
              </div>
              <p className="label-eyebrow mt-5">{d.area}</p>
              <h3 className="mt-1 font-display text-lg font-bold leading-snug text-on-surface">
                {d.title}
              </h3>
              <p className="mt-3 font-mono text-xs text-on-surface-variant">{d.id}</p>
              <div className="mt-5 flex items-center justify-between border-t border-outline-variant/15 pt-4 text-sm">
                <span className="text-on-surface-variant">Volume: {d.size}</span>
                <button className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-container-highest text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary">
                  {d.tone === "success" ? <Download className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
