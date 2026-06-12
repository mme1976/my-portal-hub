import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Pencil, Trash2, FolderCog, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type PostoRow = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  available: boolean;
};

type PostoForm = {
  name: string;
  code: string;
  description: string;
  available: boolean;
};

const emptyForm: PostoForm = { name: "", code: "", description: "", available: true };

const inputCls =
  "w-full rounded-lg bg-surface-container-low px-3 py-2.5 text-sm text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary";

export function PostosTab() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<PostoForm>({ ...emptyForm });

  const postosQ = useQuery({
    queryKey: ["admin", "postos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("postos")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PostoRow[];
    },
  });

  const reservasCountQ = useQuery({
    queryKey: ["admin", "postos-reservas-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reservas").select("posto_id");
      if (error) throw error;
      const m = new Map<string, number>();
      (data ?? []).forEach((r) => m.set(r.posto_id, (m.get(r.posto_id) ?? 0) + 1));
      return m;
    },
  });

  const upsertMut = useMutation({
    mutationFn: async ({ id, payload }: { id: string | null; payload: PostoForm }) => {
      if (!payload.name.trim() || !payload.code.trim()) {
        throw new Error("Nome e código são obrigatórios");
      }
      const row = {
        name: payload.name.trim(),
        code: payload.code.trim().toUpperCase(),
        description: payload.description.trim() || null,
        available: payload.available,
      };
      if (id) {
        const { error } = await supabase.from("postos").update(row).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("postos").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Posto guardado");
      setShowCreate(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      void qc.invalidateQueries({ queryKey: ["admin", "postos"] });
      void qc.invalidateQueries({ queryKey: ["admin", "postos-lookup"] });
    },
    onError: (e: Error) => toast.error("Falha ao guardar", { description: e.message }),
  });

  const toggleMut = useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      const { error } = await supabase.from("postos").update({ available }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "postos"] });
    },
    onError: (e: Error) => toast.error("Falha", { description: e.message }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("postos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Posto eliminado");
      void qc.invalidateQueries({ queryKey: ["admin", "postos"] });
      void qc.invalidateQueries({ queryKey: ["admin", "postos-lookup"] });
    },
    onError: (e: Error) =>
      toast.error("Falha ao eliminar", {
        description:
          e.message.includes("foreign key") || e.message.includes("violates")
            ? "Existem reservas associadas a este posto. Desative-o em vez de eliminar."
            : e.message,
      }),
  });

  const startEdit = (p: PostoRow) => {
    setEditingId(p.id);
    setShowCreate(false);
    setForm({
      name: p.name,
      code: p.code,
      description: p.description ?? "",
      available: p.available,
    });
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowCreate(false);
    setForm({ ...emptyForm });
  };

  const showingForm = showCreate || editingId !== null;

  return (
    <div className="rounded-3xl bg-surface-container-low p-6 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-on-surface">Postos de Trabalho</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Crie, edite e gira os postos disponíveis para reserva pelos investigadores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FolderCog className="h-6 w-6 text-on-surface-variant" />
          {!showingForm && (
            <button
              onClick={() => {
                setShowCreate(true);
                setEditingId(null);
                setForm({ ...emptyForm });
              }}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-tonal"
            >
              <Plus className="h-4 w-4" />
              Novo posto
            </button>
          )}
        </div>
      </header>

      {showingForm && (
        <div className="mb-6 rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-on-surface">
              {editingId ? "Editar posto" : "Novo posto"}
            </h3>
            <button
              onClick={cancelForm}
              className="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-highest"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label-eyebrow">Nome *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Posto 04-B"
                className={`${inputCls} mt-1.5`}
              />
            </div>
            <div>
              <label className="label-eyebrow">Código *</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="Ex: P04B"
                className={`${inputCls} mt-1.5 font-mono`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-eyebrow">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Sala, equipamento, software disponível…"
                className={`${inputCls} mt-1.5`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 text-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="h-4 w-4"
                />
                Disponível para reserva
              </label>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => upsertMut.mutate({ id: editingId, payload: form })}
              disabled={upsertMut.isPending}
              className="rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-tonal disabled:opacity-50"
            >
              {upsertMut.isPending ? "A guardar…" : editingId ? "Guardar alterações" : "Criar posto"}
            </button>
            <button
              onClick={cancelForm}
              className="rounded-md px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {postosQ.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (postosQ.data?.length ?? 0) === 0 ? (
        <p className="py-12 text-center text-sm text-on-surface-variant">
          Ainda não existem postos. Clique em «Novo posto» para criar o primeiro.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {postosQ.data!.map((p) => {
            const reservasCount = reservasCountQ.data?.get(p.id) ?? 0;
            return (
              <li
                key={p.id}
                className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-4 pl-5 shadow-tonal-sm"
              >
                <span
                  className={`absolute left-0 top-0 h-full w-1 ${p.available ? "bg-success" : "bg-error"}`}
                />
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-on-surface">{p.name}</p>
                      <span className="font-mono text-[0.6875rem] text-on-surface-variant">
                        {p.code}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {p.available ? "Disponível" : "Indisponível"} · {reservasCount} reserva(s)
                    </p>
                    {p.description && (
                      <p className="mt-2 text-xs text-on-surface-variant/80">{p.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => toggleMut.mutate({ id: p.id, available: !p.available })}
                      disabled={toggleMut.isPending}
                      className={
                        p.available
                          ? "relative inline-flex h-6 w-11 flex-none items-center rounded-full bg-primary transition-colors disabled:opacity-50"
                          : "relative inline-flex h-6 w-11 flex-none items-center rounded-full bg-outline-variant/40 transition-colors disabled:opacity-50"
                      }
                      aria-label={p.available ? "Desativar posto" : "Ativar posto"}
                    >
                      <span
                        className={
                          p.available
                            ? "absolute left-[22px] h-5 w-5 rounded-full bg-on-primary transition-all"
                            : "absolute left-[2px] h-5 w-5 rounded-full bg-on-surface transition-all"
                        }
                      />
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(p)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-highest"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (reservasCount > 0) {
                            toast.error("Posto com reservas associadas — desative em vez de eliminar.");
                            return;
                          }
                          if (confirm(`Eliminar o posto «${p.name}»? Esta ação é irreversível.`)) {
                            deleteMut.mutate(p.id);
                          }
                        }}
                        disabled={deleteMut.isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-error hover:bg-error-container/40 disabled:opacity-40"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
