import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ShieldCheck, ArrowLeft, ListChecks, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/_authenticated/pedidos/novo")({
  component: NovoPedido,
  head: () => ({ meta: [{ title: "Novo Pedido · DGEEC SafeCenter" }] }),
});

function NovoPedido() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dadosPretendidos, setDadosPretendidos] = useState("");
  const [finalidade, setFinalidade] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!titulo.trim() || !descricao.trim() || !dadosPretendidos.trim() || !finalidade.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("pedidos_dataset")
        .insert({
          user_id: user.id,
          titulo_estudo: titulo.trim(),
          descricao: descricao.trim(),
          dados_pretendidos: dadosPretendidos.trim(),
          finalidade: finalidade.trim(),
        })
        .select("id")
        .single();
      if (error) throw error;
      // Regista entrada inicial no histórico
      await supabase.from("pedidos_historico").insert({
        pedido_id: data.id,
        status_anterior: null,
        status_novo: "submetido",
        alterado_por: user.id,
        nota: "Pedido submetido pelo investigador.",
      });
      toast.success("Pedido submetido com sucesso");
      void navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao submeter";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
            Submeta o seu protocolo de investigação para avaliação. Após aprovação, o acesso
            aos microdados é feito presencialmente no Safe Centre — os dados nunca circulam pelo portal.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <form className="space-y-6" onSubmit={onSubmit}>
            <Card>
              <Field label="Título do Projeto de Investigação *">
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className="w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm outline outline-2 outline-transparent focus:outline-primary"
                  placeholder="Ex: Impacto das Políticas Educativas na Mobilidade Social"
                />
              </Field>
              <Field label="Descrição dos Objetivos *">
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm outline outline-2 outline-transparent focus:outline-primary"
                  placeholder="Descreva a finalidade científica do seu projeto…"
                />
              </Field>
            </Card>

            <Card
              header={
                <div className="flex items-center gap-3">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-bold text-on-surface">Dados pretendidos</h3>
                </div>
              }
            >
              <Field
                label="Conjuntos de Dados Pretendidos *"
                hint="Indique nominalmente os datasets, variáveis e período temporal que pretende analisar."
              >
                <textarea
                  value={dadosPretendidos}
                  onChange={(e) => setDadosPretendidos(e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm outline outline-2 outline-transparent focus:outline-primary"
                  placeholder="Ex: RAIDES — variáveis demográficas e académicas, anos 2018–2023…"
                />
              </Field>
            </Card>

            <Card>
              <Field
                label="Finalidade e justificação RGPD *"
                hint="Explique a finalidade científica e como cumprirá os requisitos do RGPD e do segredo estatístico."
              >
                <textarea
                  value={finalidade}
                  onChange={(e) => setFinalidade(e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm outline outline-2 outline-transparent focus:outline-primary"
                  placeholder="Indique o fundamento jurídico e as medidas de segurança…"
                />
              </Field>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <Link
                to="/dashboard"
                className="rounded-md px-5 py-3 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-gradient-primary px-7 py-3 font-display text-sm font-bold text-on-primary shadow-tonal hover:shadow-tonal-lg disabled:opacity-50"
              >
                {submitting ? "A submeter…" : "Submeter Pedido"}
              </button>
            </div>
          </form>

          {/* Aside */}
          <aside className="space-y-5">
            <div className="rounded-2xl bg-primary-container/50 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-on-primary-container" />
                <h3 className="font-display text-base font-bold text-on-primary-container">
                  Acesso no Safe Centre
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-on-primary-container">
                Após aprovação, o investigador acede aos dados exclusivamente nas instalações do
                Safe Centre. Os ficheiros nunca saem desse ambiente.
              </p>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-6">
              <p className="label-eyebrow">Estados do pedido</p>
              <ol className="mt-4 space-y-3 text-sm">
                {[
                  "Submetido",
                  "Em análise",
                  "Pedido de esclarecimento",
                  "Aprovado / Rejeitado",
                  "Processo de anonimização",
                  "Concluído",
                ].map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-surface-container-highest text-[0.6875rem] font-bold text-on-surface-variant">
                      {i + 1}
                    </div>
                    <p className="text-on-surface">{s}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-6">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h3 className="font-display text-base font-bold text-on-surface">Precisa de Ajuda?</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                Será notificado por email a cada alteração de estado. Pode acompanhar tudo no seu painel.
              </p>
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
