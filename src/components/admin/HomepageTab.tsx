import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Plus, Trash2, AlertCircle, Megaphone, Database, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Hero = { id: string; titulo: string; subtitulo: string };
type Aviso = {
  id: string;
  titulo: string;
  mensagem: string;
  ativo: boolean;
  data_fim: string | null;
};
type Destaque = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string | null;
  ordem: number;
  ativo: boolean;
};
type Contactos = {
  id: string;
  morada: string | null;
  email: string | null;
  telefone: string | null;
  horario: string | null;
};

export function HomepageTab() {
  return (
    <div className="space-y-6">
      <HeroEditor />
      <AvisosEditor />
      <DestaquesEditor />
      <ContactosEditor />
    </div>
  );
}

/* ─── Hero ─── */
function HeroEditor() {
  const qc = useQueryClient();
  const heroQ = useQuery({
    queryKey: ["admin", "homepage-hero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_hero")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Hero | null;
    },
  });

  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");

  useEffect(() => {
    if (heroQ.data) {
      setTitulo(heroQ.data.titulo);
      setSubtitulo(heroQ.data.subtitulo);
    }
  }, [heroQ.data]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!heroQ.data) throw new Error("Sem registo");
      const { error } = await supabase
        .from("homepage_hero")
        .update({ titulo, subtitulo, updated_at: new Date().toISOString() })
        .eq("id", heroQ.data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Hero da homepage atualizado");
      void qc.invalidateQueries({ queryKey: ["admin", "homepage-hero"] });
      void qc.invalidateQueries({ queryKey: ["homepage", "hero"] });
    },
    onError: (e: Error) => toast.error("Falha ao guardar", { description: e.message }),
  });

  return (
    <Section title="Cabeçalho da homepage" subtitle="Texto principal apresentado a todos os visitantes.">
      {heroQ.isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (
        <>
          <Field label="Título">
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-md bg-surface-container-lowest px-4 py-3 text-sm shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
            />
          </Field>
          <Field label="Subtítulo">
            <textarea
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              rows={3}
              className="w-full rounded-md bg-surface-container-lowest px-4 py-3 text-sm shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
            />
          </Field>
          <div>
            <button
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-tonal disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Guardar
            </button>
          </div>
        </>
      )}
    </Section>
  );
}

/* ─── Avisos ─── */
function AvisosEditor() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "homepage-avisos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_avisos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Aviso[];
    },
  });

  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");
  const [novaDataFim, setNovaDataFim] = useState("");

  const addMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("homepage_avisos").insert({
        titulo: novoTitulo.trim(),
        mensagem: novaMensagem.trim(),
        ativo: true,
        data_fim: novaDataFim || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aviso criado");
      setNovoTitulo("");
      setNovaMensagem("");
      setNovaDataFim("");
      void qc.invalidateQueries({ queryKey: ["admin", "homepage-avisos"] });
      void qc.invalidateQueries({ queryKey: ["homepage", "avisos"] });
    },
    onError: (e: Error) => toast.error("Falha", { description: e.message }),
  });

  const toggleMut = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("homepage_avisos").update({ ativo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "homepage-avisos"] });
      void qc.invalidateQueries({ queryKey: ["homepage", "avisos"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homepage_avisos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aviso removido");
      void qc.invalidateQueries({ queryKey: ["admin", "homepage-avisos"] });
      void qc.invalidateQueries({ queryKey: ["homepage", "avisos"] });
    },
  });

  return (
    <Section
      title="Avisos / Banner"
      subtitle="Mensagens temporárias visíveis na homepage."
      icon={Megaphone}
    >
      <div className="rounded-xl bg-surface-container-lowest p-4">
        <p className="label-eyebrow">Novo aviso</p>
        <input
          value={novoTitulo}
          onChange={(e) => setNovoTitulo(e.target.value)}
          placeholder="Título"
          className="mt-2 w-full rounded-md bg-surface-container px-3 py-2 text-sm outline outline-2 outline-transparent focus:outline-primary"
        />
        <textarea
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          rows={2}
          placeholder="Mensagem"
          className="mt-2 w-full rounded-md bg-surface-container px-3 py-2 text-sm outline outline-2 outline-transparent focus:outline-primary"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            type="date"
            value={novaDataFim}
            onChange={(e) => setNovaDataFim(e.target.value)}
            className="rounded-md bg-surface-container px-3 py-2 text-sm outline outline-2 outline-transparent focus:outline-primary"
          />
          <button
            onClick={() => {
              if (!novoTitulo.trim() || !novaMensagem.trim()) {
                toast.error("Preencha título e mensagem");
                return;
              }
              addMut.mutate();
            }}
            disabled={addMut.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-on-primary disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </button>
        </div>
      </div>

      {q.isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (q.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-on-surface-variant">Sem avisos.</p>
      ) : (
        <ul className="space-y-2">
          {q.data!.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-surface-container-lowest p-4"
            >
              <div className="flex flex-1 items-start gap-3 min-w-0">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-none text-warning" />
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface">{a.titulo}</p>
                  <p className="text-sm text-on-surface-variant">{a.mensagem}</p>
                  {a.data_fim && (
                    <p className="mt-1 text-[0.6875rem] text-on-surface-variant">
                      Termina a {new Date(a.data_fim).toLocaleDateString("pt-PT")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMut.mutate({ id: a.id, ativo: !a.ativo })}
                  className={
                    a.ativo
                      ? "rounded-full bg-success-container px-3 py-1 text-xs font-semibold text-on-success-container"
                      : "rounded-full bg-surface-container-highest px-3 py-1 text-xs font-medium text-on-surface-variant"
                  }
                >
                  {a.ativo ? "Ativo" : "Inativo"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Remover este aviso?")) deleteMut.mutate(a.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-error hover:bg-error-container/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/* ─── Destaques ─── */
function DestaquesEditor() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "homepage-destaques"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_datasets_destaque")
        .select("*")
        .order("ordem", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Destaque[];
    },
  });

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");

  const addMut = useMutation({
    mutationFn: async () => {
      const ordem = (q.data?.length ?? 0);
      const { error } = await supabase.from("homepage_datasets_destaque").insert({
        nome: nome.trim(),
        descricao: descricao.trim(),
        categoria: categoria.trim() || null,
        ordem,
        ativo: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Destaque adicionado");
      setNome("");
      setDescricao("");
      setCategoria("");
      void qc.invalidateQueries({ queryKey: ["admin", "homepage-destaques"] });
      void qc.invalidateQueries({ queryKey: ["homepage", "destaques"] });
    },
    onError: (e: Error) => toast.error("Falha", { description: e.message }),
  });

  const toggleMut = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("homepage_datasets_destaque")
        .update({ ativo })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "homepage-destaques"] });
      void qc.invalidateQueries({ queryKey: ["homepage", "destaques"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("homepage_datasets_destaque")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Destaque removido");
      void qc.invalidateQueries({ queryKey: ["admin", "homepage-destaques"] });
      void qc.invalidateQueries({ queryKey: ["homepage", "destaques"] });
    },
  });

  return (
    <Section
      title="Datasets em destaque"
      subtitle="Categorias / datasets apresentados na homepage."
      icon={Database}
    >
      <div className="rounded-xl bg-surface-container-lowest p-4">
        <p className="label-eyebrow">Novo destaque</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome (ex: Censos 2021)"
            className="rounded-md bg-surface-container px-3 py-2 text-sm outline outline-2 outline-transparent focus:outline-primary"
          />
          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Categoria (opcional)"
            className="rounded-md bg-surface-container px-3 py-2 text-sm outline outline-2 outline-transparent focus:outline-primary"
          />
        </div>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          placeholder="Descrição breve"
          className="mt-2 w-full rounded-md bg-surface-container px-3 py-2 text-sm outline outline-2 outline-transparent focus:outline-primary"
        />
        <button
          onClick={() => {
            if (!nome.trim() || !descricao.trim()) {
              toast.error("Preencha nome e descrição");
              return;
            }
            addMut.mutate();
          }}
          disabled={addMut.isPending}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-on-primary disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      </div>

      {q.isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (q.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-on-surface-variant">Sem destaques.</p>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {q.data!.map((d) => (
            <li
              key={d.id}
              className="rounded-xl bg-surface-container-lowest p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface">{d.nome}</p>
                  {d.categoria && (
                    <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                      {d.categoria}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-on-surface-variant">{d.descricao}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => toggleMut.mutate({ id: d.id, ativo: !d.ativo })}
                  className={
                    d.ativo
                      ? "rounded-full bg-success-container px-3 py-1 text-xs font-semibold text-on-success-container"
                      : "rounded-full bg-surface-container-highest px-3 py-1 text-xs font-medium text-on-surface-variant"
                  }
                >
                  {d.ativo ? "Visível" : "Oculto"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Remover este destaque?")) deleteMut.mutate(d.id);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-error hover:bg-error-container/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/* ─── Contactos ─── */
function ContactosEditor() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "homepage-contactos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_contactos")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Contactos | null;
    },
  });

  const [morada, setMorada] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [horario, setHorario] = useState("");

  useEffect(() => {
    if (q.data) {
      setMorada(q.data.morada ?? "");
      setEmail(q.data.email ?? "");
      setTelefone(q.data.telefone ?? "");
      setHorario(q.data.horario ?? "");
    }
  }, [q.data]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!q.data) throw new Error("Sem registo");
      const { error } = await supabase
        .from("homepage_contactos")
        .update({
          morada,
          email,
          telefone,
          horario,
          updated_at: new Date().toISOString(),
        })
        .eq("id", q.data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contactos atualizados");
      void qc.invalidateQueries({ queryKey: ["admin", "homepage-contactos"] });
      void qc.invalidateQueries({ queryKey: ["homepage", "contactos"] });
    },
    onError: (e: Error) => toast.error("Falha", { description: e.message }),
  });

  return (
    <Section title="Contactos institucionais" subtitle="Dados do Safe Centre." icon={Phone}>
      {q.isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (
        <>
          <Field label="Morada">
            <input
              value={morada}
              onChange={(e) => setMorada(e.target.value)}
              className="w-full rounded-md bg-surface-container-lowest px-4 py-3 text-sm shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-surface-container-lowest px-4 py-3 text-sm shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
              />
            </Field>
            <Field label="Telefone">
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full rounded-md bg-surface-container-lowest px-4 py-3 text-sm shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
              />
            </Field>
          </div>
          <Field label="Horário">
            <input
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full rounded-md bg-surface-container-lowest px-4 py-3 text-sm shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary"
            />
          </Field>
          <button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-tonal disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Guardar
          </button>
        </>
      )}
    </Section>
  );
}

/* ─── shared ─── */
function Section({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-surface-container-low p-6 md:p-8">
      <header className="mb-5 flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h2 className="font-display text-lg font-bold text-on-surface">{title}</h2>
          <p className="text-sm text-on-surface-variant">{subtitle}</p>
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label-eyebrow">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
