import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Upload, ArrowLeft, ListChecks, HelpCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/pedidos/novo")({
  component: NovoPedido,
  head: () => ({ meta: [{ title: "Novo Pedido · DGEEC SafeCenter" }] }),
});

function NovoPedido() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </Link>

        <div className="mt-4">
          <p className="label-eyebrow">Formulário de Acesso</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-on-surface">
            Novo Pedido de Dataset
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
            Submeta o seu protocolo de investigação para avaliação. O SafeCenter garante a
            segurança e anonimização dos microdados para fins de investigação académica e
            estatística.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <form className="space-y-6">
            <Card>
              <Field label="Título do Projeto de Investigação">
                <input
                  className="w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm outline outline-2 outline-transparent focus:outline-primary"
                  placeholder="Ex: Impacto das Políticas Educativas na Mobilidade Social"
                />
              </Field>
              <Field label="Descrição dos Objetivos">
                <textarea
                  rows={4}
                  className="w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm outline outline-2 outline-transparent focus:outline-primary"
                  placeholder="Descreva brevemente a finalidade científica do seu projeto..."
                />
              </Field>
            </Card>

            <Card
              header={
                <div className="flex items-center gap-3">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-bold text-on-surface">
                    Seleção de Dados
                  </h3>
                </div>
              }
            >
              <Field label="Conjuntos de Dados Pretendidos">
                <div className="flex flex-wrap items-center gap-2 rounded-md bg-surface-container-highest p-3 outline outline-2 outline-transparent focus-within:outline-primary">
                  {["Censos 2021", "RAIDES"].map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1 text-xs font-semibold text-on-primary-container"
                    >
                      {t}
                      <button className="opacity-60 hover:opacity-100">×</button>
                    </span>
                  ))}
                  <input
                    className="min-w-[200px] flex-1 bg-transparent px-2 text-sm outline-none"
                    placeholder="Selecione um dataset…"
                  />
                </div>
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Período: Início">
                  <input
                    type="date"
                    className="w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm outline outline-2 outline-transparent focus:outline-primary"
                  />
                </Field>
                <Field label="Período: Fim">
                  <input
                    type="date"
                    className="w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm outline outline-2 outline-transparent focus:outline-primary"
                  />
                </Field>
              </div>
            </Card>

            <Card>
              <Field label="Justificação e Conformidade RGPD" hint="Explique como os dados serão processados de acordo com o Regulamento Geral de Proteção de Dados.">
                <textarea
                  rows={4}
                  className="w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm outline outline-2 outline-transparent focus:outline-primary"
                  placeholder="Indique as medidas de segurança e o fundamento jurídico…"
                />
              </Field>
              <Field label="Documentação de Suporte">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-surface-container-highest px-6 py-10 text-center transition-colors hover:bg-surface-container-high">
                  <Upload className="h-6 w-6 text-on-surface-variant" />
                  <p className="text-sm text-on-surface">
                    <span className="font-semibold text-primary">Carregar ficheiro</span> ou
                    arraste e solte
                  </p>
                  <p className="text-[0.6875rem] text-on-surface-variant">
                    PDF, DOCX até 10MB · Certificado de Ética / Protocolo
                  </p>
                  <input type="file" className="hidden" />
                </label>
              </Field>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-md px-5 py-3 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Guardar Rascunho
              </button>
              <button
                type="submit"
                className="rounded-md bg-gradient-primary px-7 py-3 font-display text-sm font-bold text-on-primary shadow-tonal hover:shadow-tonal-lg"
              >
                Submeter Pedido
              </button>
            </div>
          </form>

          {/* Aside */}
          <aside className="space-y-5">
            <div className="rounded-2xl bg-primary-container/50 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-on-primary-container" />
                <h3 className="font-display text-base font-bold text-on-primary-container">
                  Segurança Garantida
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-on-primary-container">
                Todos os pedidos passam por uma verificação rigorosa pela comissão de ética da
                DGEEC. Os dados fornecidos são anonimizados através de técnicas de
                K-anonimato antes da disponibilização.
              </p>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-6">
              <p className="label-eyebrow">Fluxo de Aprovação</p>
              <ol className="mt-4 space-y-4">
                {[
                  { n: 1, t: "Submissão", d: "Revisão inicial do formulário.", active: true },
                  { n: 2, t: "Análise Ética", d: "Verificação de conformidade RGPD." },
                  { n: 3, t: "Extração e Anonimização", d: "Preparação técnica dos ficheiros." },
                ].map((s) => (
                  <li key={s.n} className="flex gap-3">
                    <div
                      className={
                        s.active
                          ? "flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary"
                          : "flex h-7 w-7 flex-none items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold text-on-surface-variant"
                      }
                    >
                      {s.n}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{s.t}</p>
                      <p className="text-xs text-on-surface-variant">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-6">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h3 className="font-display text-base font-bold text-on-surface">
                  Precisa de Ajuda?
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                Consulte o nosso Guia de Investigador para saber quais os datasets disponíveis e os
                requisitos de acesso.
              </p>
              <a className="mt-4 inline-block text-xs font-semibold text-primary hover:underline" href="#">
                Ver Documentação ↗
              </a>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ children, header }: { children: React.ReactNode; header?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface-container-low p-6 md:p-8">
      {header && <div className="mb-5">{header}</div>}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="label-eyebrow">{label}</p>
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}
