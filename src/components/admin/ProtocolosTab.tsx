import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  FileText,
  Plus,
  X,
  ShieldCheck,
  UserPlus,
  Users,
  Download,
  ChevronRight,
  Calendar,
  Trash2,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StatusChip } from "@/components/StatusChip";
import {
  createInvestigadorForProtocolo,
  addExistingInvestigadorToProtocolo,
  removeInvestigadorFromProtocolo,
} from "@/lib/admin-users.functions";

type ProtocoloEstado = "ativo" | "inativo";

type ProtocoloRow = {
  id: string;
  nome: string;
  estado: ProtocoloEstado;
  tematica: string;
  data_assinatura: string;
  data_terminus: string | null;
  outorgantes: string;
  finalidade: string;
  observacoes: string | null;
  created_at: string;
};

type ProtocoloDoc = {
  id: string;
  filename: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  descricao: string | null;
  uploaded_at: string;
};

type InvestigadorRow = {
  id: string;
  full_name: string;
  email: string;
  institution: string | null;
  position: string | null;
};

const emptyForm = {
  nome: "",
  estado: "ativo" as ProtocoloEstado,
  tematica: "",
  data_assinatura: new Date().toISOString().slice(0, 10),
  data_terminus: "",
  outorgantes: "",
  finalidade: "",
  observacoes: "",
  files: [] as File[],
};

const MAX_FILE_MB = 20;

function isExpired(p: Pick<ProtocoloRow, "data_terminus">) {
  if (!p.data_terminus) return false;
  return p.data_terminus < new Date().toISOString().slice(0, 10);
}

async function uploadProtocoloDocs(protocoloId: string, files: File[], adminUserId?: string) {
  for (const f of files) {
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      throw new Error(`"${f.name}" excede ${MAX_FILE_MB} MB`);
    }
    const safe = f.name.replace(/[^\w.\-]+/g, "_");
    const path = `${protocoloId}/${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage
      .from("protocolos")
      .upload(path, f, { contentType: f.type || undefined });
    if (upErr) throw upErr;
    const { error: insErr } = await supabase.from("protocolo_documentos").insert({
      protocolo_id: protocoloId,
      filename: f.name,
      storage_path: path,
      mime_type: f.type || null,
      size_bytes: f.size,
      uploaded_by: adminUserId ?? null,
    });
    if (insErr) throw insErr;
  }
}

export function ProtocolosTab({ adminUserId }: { adminUserId: string | undefined }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const protocolosQ = useQuery({
    queryKey: ["admin", "protocolos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protocolos")
        .select("id, nome, estado, tematica, data_assinatura, data_terminus, outorgantes, finalidade, observacoes, created_at")
        .order("data_assinatura", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProtocoloRow[];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim() || !form.tematica.trim() || !form.outorgantes.trim() || !form.finalidade.trim()) {
        throw new Error("Preencha todos os campos obrigatórios");
      }
      if (form.data_terminus && form.data_terminus < form.data_assinatura) {
        throw new Error("A data de términus tem de ser posterior à data de assinatura");
      }
      const { data: created, error } = await supabase
        .from("protocolos")
        .insert({
          nome: form.nome.trim(),
          estado: form.estado,
          tematica: form.tematica.trim(),
          data_assinatura: form.data_assinatura,
          data_terminus: form.data_terminus || null,
          outorgantes: form.outorgantes.trim(),
          finalidade: form.finalidade.trim(),
          observacoes: form.observacoes.trim() || null,
          created_by: adminUserId ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (form.files.length) {
        await uploadProtocoloDocs(created.id, form.files, adminUserId);
      }
    },
    onSuccess: () => {
      toast.success("Protocolo criado");
      setForm({ ...emptyForm });
      setShowCreate(false);
      void qc.invalidateQueries({ queryKey: ["admin", "protocolos"] });
    },
    onError: (e: Error) => toast.error("Falha ao criar", { description: e.message }),
  });

  const updateProtocoloMut = useMutation({
    mutationFn: async (patch: { id: string; estado?: ProtocoloEstado; data_terminus?: string | null }) => {
      const { error } = await supabase
        .from("protocolos")
        .update({
          ...(patch.estado ? { estado: patch.estado } : {}),
          ...(patch.data_terminus !== undefined ? { data_terminus: patch.data_terminus } : {}),
        })
        .eq("id", patch.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Protocolo atualizado");
      void qc.invalidateQueries({ queryKey: ["admin", "protocolos"] });
    },
    onError: (e: Error) => toast.error("Falha", { description: e.message }),
  });

  const open = protocolosQ.data?.find((p) => p.id === openId) ?? null;

  return (
    <div className="rounded-3xl bg-surface-container-low p-6 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-on-surface">Protocolos</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Gestão dos protocolos institucionais. Crie um protocolo, anexe os documentos e associe os
            investigadores que terão acesso ao portal.
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-tonal"
        >
          <Plus className="h-4 w-4" />
          Novo protocolo
        </button>
      </header>

      {showCreate && (
        <div className="mb-6 rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm">
          <h3 className="font-display text-lg font-bold text-on-surface">Novo protocolo</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Nome do protocolo *">
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Temática *">
              <input value={form.tematica} onChange={(e) => setForm({ ...form, tematica: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Estado">
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value as ProtocoloEstado })}
                className={inputCls}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
            <Field label="Data de assinatura *">
              <input type="date" value={form.data_assinatura} onChange={(e) => setForm({ ...form, data_assinatura: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Data de términus">
              <input type="date" value={form.data_terminus} onChange={(e) => setForm({ ...form, data_terminus: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Outorgantes *">
              <input value={form.outorgantes} onChange={(e) => setForm({ ...form, outorgantes: e.target.value })} placeholder="Ex: DGEEC, Universidade X" className={inputCls} />
            </Field>
            <Field label="Finalidade *" className="md:col-span-2">
              <textarea value={form.finalidade} onChange={(e) => setForm({ ...form, finalidade: e.target.value })} rows={3} className={inputCls} />
            </Field>
            <Field label="Observações" className="md:col-span-2">
              <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} className={inputCls} />
            </Field>
            <Field label="Documentos do protocolo (múltiplos ficheiros)" className="md:col-span-2">
              <input
                type="file"
                multiple
                onChange={(e) => setForm({ ...form, files: Array.from(e.target.files ?? []) })}
                className="block w-full text-sm text-on-surface file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-primary"
              />
              {form.files.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-on-surface-variant">
                  {form.files.map((f, i) => (
                    <li key={i}>• {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</li>
                  ))}
                </ul>
              )}
            </Field>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => createMut.mutate()}
              disabled={createMut.isPending}
              className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-tonal disabled:opacity-50"
            >
              {createMut.isPending ? "A guardar…" : "Criar protocolo"}
            </button>
            <button onClick={() => setShowCreate(false)} className="rounded-md px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl">
        <div className="grid grid-cols-12 bg-surface-container px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          <div className="col-span-4">Protocolo</div>
          <div className="col-span-3">Temática</div>
          <div className="col-span-2">Assinatura</div>
          <div className="col-span-2">Términus</div>
          <div className="col-span-1">Estado</div>
        </div>
        {protocolosQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (protocolosQ.data?.length ?? 0) === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-on-surface-variant">
            Ainda não existem protocolos.
          </p>
        ) : (
          <ul>
            {protocolosQ.data!.map((p) => {
              const expired = isExpired(p);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => setOpenId(p.id)}
                    className="grid w-full grid-cols-12 items-center gap-3 px-5 py-4 text-left text-sm transition-colors hover:bg-surface-container-high"
                  >
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-on-surface">{p.nome}</p>
                        <p className="truncate text-xs text-on-surface-variant">{p.outorgantes}</p>
                      </div>
                    </div>
                    <div className="col-span-3 truncate text-on-surface">{p.tematica}</div>
                    <div className="col-span-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(p.data_assinatura + "T00:00:00").toLocaleDateString("pt-PT")}
                    </div>
                    <div className="col-span-2 text-xs">
                      {p.data_terminus ? (
                        <span className={expired ? "font-semibold text-on-error-container" : "text-on-surface-variant"}>
                          {new Date(p.data_terminus + "T00:00:00").toLocaleDateString("pt-PT")}
                          {expired ? " (expirado)" : ""}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center gap-2">
                      <StatusChip tone={p.estado === "ativo" && !expired ? "success" : "neutral"} dot>
                        {p.estado === "ativo" && !expired ? "Ativo" : "Inativo"}
                      </StatusChip>
                      <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {open && (
        <ProtocoloDrawer
          protocolo={open}
          adminUserId={adminUserId}
          onClose={() => setOpenId(null)}
          onToggleEstado={(estado) => updateProtocoloMut.mutate({ id: open.id, estado })}
          onSetTerminus={(date) => updateProtocoloMut.mutate({ id: open.id, data_terminus: date })}
        />
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg bg-surface-container-low px-3 py-2.5 text-sm text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary";

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="label-eyebrow">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ProtocoloDrawer({
  protocolo,
  adminUserId,
  onClose,
  onToggleEstado,
  onSetTerminus,
}: {
  protocolo: ProtocoloRow;
  adminUserId: string | undefined;
  onClose: () => void;
  onToggleEstado: (estado: ProtocoloEstado) => void;
  onSetTerminus: (date: string | null) => void;
}) {
  const qc = useQueryClient();
  const createInvestigador = useServerFn(createInvestigadorForProtocolo);
  const addExisting = useServerFn(addExistingInvestigadorToProtocolo);
  const removeMember = useServerFn(removeInvestigadorFromProtocolo);
  const [showInv, setShowInv] = useState(false);
  const [showAddExisting, setShowAddExisting] = useState(false);
  const [existingEmail, setExistingEmail] = useState("");
  const [terminusEdit, setTerminusEdit] = useState(protocolo.data_terminus ?? "");
  const [newDocs, setNewDocs] = useState<File[]>([]);
  const [inv, setInv] = useState({
    fullName: "",
    email: "",
    password: "",
    institution: "",
    position: "Investigador",
  });

  const expired = isExpired(protocolo);

  const docsQ = useQuery({
    queryKey: ["admin", "protocolo-docs", protocolo.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protocolo_documentos")
        .select("id, filename, storage_path, mime_type, size_bytes, descricao, uploaded_at")
        .eq("protocolo_id", protocolo.id)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProtocoloDoc[];
    },
  });

  const uploadDocsMut = useMutation({
    mutationFn: async () => {
      if (!newDocs.length) throw new Error("Selecione pelo menos um ficheiro");
      await uploadProtocoloDocs(protocolo.id, newDocs, adminUserId);
    },
    onSuccess: () => {
      toast.success("Documentos carregados");
      setNewDocs([]);
      void qc.invalidateQueries({ queryKey: ["admin", "protocolo-docs", protocolo.id] });
    },
    onError: (e: Error) => toast.error("Falha ao carregar", { description: e.message }),
  });

  const deleteDocMut = useMutation({
    mutationFn: async (doc: ProtocoloDoc) => {
      await supabase.storage.from("protocolos").remove([doc.storage_path]);
      const { error } = await supabase.from("protocolo_documentos").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Documento removido");
      void qc.invalidateQueries({ queryKey: ["admin", "protocolo-docs", protocolo.id] });
    },
    onError: (e: Error) => toast.error("Falha", { description: e.message }),
  });

  const addExistingMut = useMutation({
    mutationFn: async () => {
      if (!existingEmail.trim()) throw new Error("Indique o email");
      return await addExisting({ data: { email: existingEmail.trim(), protocoloId: protocolo.id } });
    },
    onSuccess: () => {
      toast.success("Investigador adicionado");
      setExistingEmail("");
      setShowAddExisting(false);
      void qc.invalidateQueries({ queryKey: ["admin", "protocolo-investigadores", protocolo.id] });
    },
    onError: (e: Error) => toast.error("Falha", { description: e.message }),
  });

  const removeMut = useMutation({
    mutationFn: async (userId: string) => await removeMember({ data: { userId, protocoloId: protocolo.id } }),
    onSuccess: () => {
      toast.success("Investigador removido");
      void qc.invalidateQueries({ queryKey: ["admin", "protocolo-investigadores", protocolo.id] });
    },
    onError: (e: Error) => toast.error("Falha", { description: e.message }),
  });

  const investigadoresQ = useQuery({
    queryKey: ["admin", "protocolo-investigadores", protocolo.id],
    queryFn: async () => {
      const { data: members, error } = await supabase
        .from("protocolo_membros")
        .select("user_id")
        .eq("protocolo_id", protocolo.id);
      if (error) throw error;
      const ids = (members ?? []).map((m) => m.user_id);
      if (!ids.length) return [] as InvestigadorRow[];
      const { data: profs, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, institution, position")
        .in("id", ids);
      if (pErr) throw pErr;
      return (profs ?? []) as InvestigadorRow[];
    },
  });

  const createInvMut = useMutation({
    mutationFn: async () => {
      if (!inv.fullName.trim() || !inv.email.trim() || inv.password.length < 8) {
        throw new Error("Nome, email e password (mín. 8) são obrigatórios");
      }
      return await createInvestigador({
        data: {
          fullName: inv.fullName.trim(),
          email: inv.email.trim(),
          password: inv.password,
          institution: inv.institution.trim() || null,
          position: inv.position.trim() || "Investigador",
          protocoloId: protocolo.id,
        },
      });
    },
    onSuccess: () => {
      toast.success("Investigador criado");
      setInv({ fullName: "", email: "", password: "", institution: "", position: "Investigador" });
      setShowInv(false);
      void qc.invalidateQueries({ queryKey: ["admin", "protocolo-investigadores", protocolo.id] });
      void qc.invalidateQueries({ queryKey: ["admin", "profiles-with-status"] });
    },
    onError: (e: Error) => toast.error("Falha", { description: e.message }),
  });

  const downloadDoc = async (doc: ProtocoloDoc) => {
    const { data, error } = await supabase.storage.from("protocolos").createSignedUrl(doc.storage_path, 60);
    if (error || !data) {
      toast.error("Falha ao gerar link");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex w-full max-w-xl flex-col overflow-y-auto bg-surface-container-lowest shadow-tonal-lg">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-outline-variant/20 bg-surface-container-lowest px-6 py-5">
          <div className="min-w-0">
            <p className="label-eyebrow">Protocolo</p>
            <h3 className="mt-1 font-display text-xl font-bold text-on-surface">{protocolo.nome}</h3>
            <p className="mt-1 truncate text-xs text-on-surface-variant">{protocolo.outorgantes}</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 flex-none items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-highest">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-6 px-6 py-6">
          {expired && (
            <div className="flex items-start gap-3 rounded-xl bg-error-container/50 p-4 text-sm text-on-error-container">
              <AlertTriangle className="h-4 w-4 flex-none" />
              <p>
                O protocolo passou a data de términus. Investigadores só podem consultar informação;
                não podem submeter pedidos nem reservar postos. Altere a data de términus para
                reativar.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="label-eyebrow">Estado</p>
              <div className="mt-2 flex items-center gap-2">
                <StatusChip tone={protocolo.estado === "ativo" && !expired ? "success" : "neutral"} dot>
                  {protocolo.estado === "ativo" && !expired ? "Ativo" : "Inativo"}
                </StatusChip>
                <button
                  onClick={() => onToggleEstado(protocolo.estado === "ativo" ? "inativo" : "ativo")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {protocolo.estado === "ativo" ? "Desativar" : "Ativar"}
                </button>
              </div>
            </div>
            <div>
              <p className="label-eyebrow">Data de assinatura</p>
              <p className="mt-2 text-on-surface">
                {new Date(protocolo.data_assinatura + "T00:00:00").toLocaleDateString("pt-PT")}
              </p>
            </div>
            <div className="col-span-2">
              <p className="label-eyebrow">Data de términus</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={terminusEdit}
                  onChange={(e) => setTerminusEdit(e.target.value)}
                  className={inputCls + " max-w-[200px]"}
                />
                <button
                  onClick={() => onSetTerminus(terminusEdit || null)}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary"
                >
                  Guardar
                </button>
                {protocolo.data_terminus && (
                  <button
                    onClick={() => {
                      setTerminusEdit("");
                      onSetTerminus(null);
                    }}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface"
                  >
                    Remover
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">
                Após esta data o protocolo torna-se inativo automaticamente. Alterá-la para uma data
                futura reativa o protocolo.
              </p>
            </div>
            <div className="col-span-2">
              <p className="label-eyebrow">Temática</p>
              <p className="mt-2 text-on-surface">{protocolo.tematica}</p>
            </div>
            <div className="col-span-2">
              <p className="label-eyebrow">Finalidade</p>
              <p className="mt-2 whitespace-pre-wrap text-on-surface">{protocolo.finalidade}</p>
            </div>
            {protocolo.observacoes && (
              <div className="col-span-2">
                <p className="label-eyebrow">Observações</p>
                <p className="mt-2 whitespace-pre-wrap text-on-surface">{protocolo.observacoes}</p>
              </div>
            )}
          </div>

          {/* Documentos */}
          <div className="rounded-2xl bg-surface-container-low p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-on-surface-variant" />
                <h4 className="font-display text-base font-bold text-on-surface">Documentos do protocolo</h4>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="file"
                multiple
                onChange={(e) => setNewDocs(Array.from(e.target.files ?? []))}
                className="block text-xs text-on-surface file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-primary"
              />
              <button
                onClick={() => uploadDocsMut.mutate()}
                disabled={uploadDocsMut.isPending || !newDocs.length}
                className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-on-primary disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploadDocsMut.isPending ? "A carregar…" : "Carregar"}
              </button>
            </div>

            <div className="mt-4">
              {docsQ.isLoading ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
              ) : (docsQ.data?.length ?? 0) === 0 ? (
                <p className="py-4 text-center text-sm text-on-surface-variant">Sem documentos.</p>
              ) : (
                <ul className="space-y-2">
                  {docsQ.data!.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 rounded-lg bg-surface-container-lowest p-3">
                      <FileText className="h-4 w-4 flex-none text-on-surface-variant" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-on-surface">{d.filename}</p>
                        <p className="text-xs text-on-surface-variant">
                          {d.size_bytes ? (d.size_bytes / 1024 / 1024).toFixed(2) + " MB" : ""}
                          {" · "}
                          {new Date(d.uploaded_at).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadDoc(d)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-highest"
                        title="Descarregar"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Remover este documento?")) deleteDocMut.mutate(d);
                        }}
                        disabled={deleteDocMut.isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-error-container hover:text-on-error-container disabled:opacity-50"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Investigadores */}
          <div className="rounded-2xl bg-surface-container-low p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-on-surface-variant" />
                <h4 className="font-display text-base font-bold text-on-surface">Investigadores associados</h4>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddExisting((v) => !v); setShowInv(false); }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-on-surface"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Adicionar existente
                </button>
                <button
                  onClick={() => { setShowInv((v) => !v); setShowAddExisting(false); }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Nova conta
                </button>
              </div>
            </div>

            {showAddExisting && (
              <div className="mt-4 space-y-3 rounded-xl bg-surface-container-lowest p-4">
                <Field label="Email do investigador já existente *">
                  <input type="email" value={existingEmail} onChange={(e) => setExistingEmail(e.target.value)} className={inputCls} placeholder="investigador@exemplo.pt" />
                </Field>
                <div className="flex gap-2">
                  <button onClick={() => addExistingMut.mutate()} disabled={addExistingMut.isPending} className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50">
                    {addExistingMut.isPending ? "A associar…" : "Associar"}
                  </button>
                  <button onClick={() => setShowAddExisting(false)} className="rounded-md px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface">Cancelar</button>
                </div>
              </div>
            )}

            {showInv && (
              <div className="mt-4 space-y-3 rounded-xl bg-surface-container-lowest p-4">
                <Field label="Nome completo *"><input value={inv.fullName} onChange={(e) => setInv({ ...inv, fullName: e.target.value })} className={inputCls} /></Field>
                <Field label="Email *"><input type="email" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} className={inputCls} /></Field>
                <Field label="Password inicial (mín. 8) *"><input type="text" value={inv.password} onChange={(e) => setInv({ ...inv, password: e.target.value })} className={inputCls} /></Field>
                <Field label="Instituição"><input value={inv.institution} onChange={(e) => setInv({ ...inv, institution: e.target.value })} className={inputCls} /></Field>
                <Field label="Cargo"><input value={inv.position} onChange={(e) => setInv({ ...inv, position: e.target.value })} className={inputCls} /></Field>
                <div className="flex gap-2">
                  <button onClick={() => createInvMut.mutate()} disabled={createInvMut.isPending} className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50">
                    {createInvMut.isPending ? "A criar…" : "Criar conta"}
                  </button>
                  <button onClick={() => setShowInv(false)} className="rounded-md px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface">Cancelar</button>
                </div>
              </div>
            )}

            <div className="mt-4">
              {investigadoresQ.isLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : (investigadoresQ.data?.length ?? 0) === 0 ? (
                <p className="py-4 text-center text-sm text-on-surface-variant">Sem investigadores associados.</p>
              ) : (
                <ul className="space-y-2">
                  {investigadoresQ.data!.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 rounded-lg bg-surface-container-lowest p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-on-surface">{u.full_name || u.email}</p>
                        <p className="truncate text-xs text-on-surface-variant">{u.email} · {u.position ?? "Investigador"}</p>
                      </div>
                      <button
                        onClick={() => { if (confirm(`Remover ${u.full_name || u.email} deste protocolo?`)) removeMut.mutate(u.id); }}
                        disabled={removeMut.isPending}
                        className="flex h-8 w-8 flex-none items-center justify-center rounded-md text-on-surface-variant hover:bg-error-container hover:text-on-error-container disabled:opacity-50"
                        title="Remover do protocolo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
