import { useMemo, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StatusChip } from "@/components/StatusChip";
import { createInvestigadorForProtocolo } from "@/lib/admin-users.functions";

type ProtocoloEstado = "ativo" | "inativo";

type ProtocoloRow = {
  id: string;
  nome: string;
  estado: ProtocoloEstado;
  tematica: string;
  data_assinatura: string;
  outorgantes: string;
  finalidade: string;
  observacoes: string | null;
  protocolo_pdf_path: string | null;
  created_at: string;
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
  outorgantes: "",
  finalidade: "",
  observacoes: "",
  pdf: null as File | null,
};

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
        .select("*")
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
      let pdfPath: string | null = null;
      if (form.pdf) {
        if (form.pdf.type !== "application/pdf") {
          throw new Error("O ficheiro tem de ser PDF");
        }
        if (form.pdf.size > 20 * 1024 * 1024) {
          throw new Error("PDF não pode exceder 20 MB");
        }
        const safeName = form.nome.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
        pdfPath = `${Date.now()}-${safeName}.pdf`;
        const { error: upErr } = await supabase.storage
          .from("protocolos")
          .upload(pdfPath, form.pdf, { contentType: "application/pdf" });
        if (upErr) throw upErr;
      }
      const { error } = await supabase.from("protocolos").insert({
        nome: form.nome.trim(),
        estado: form.estado,
        tematica: form.tematica.trim(),
        data_assinatura: form.data_assinatura,
        outorgantes: form.outorgantes.trim(),
        finalidade: form.finalidade.trim(),
        observacoes: form.observacoes.trim() || null,
        protocolo_pdf_path: pdfPath,
        created_by: adminUserId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Protocolo criado");
      setForm({ ...emptyForm });
      setShowCreate(false);
      void qc.invalidateQueries({ queryKey: ["admin", "protocolos"] });
    },
    onError: (e: Error) => toast.error("Falha ao criar", { description: e.message }),
  });

  const toggleEstadoMut = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: ProtocoloEstado }) => {
      const { error } = await supabase.from("protocolos").update({ estado }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estado atualizado");
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
            Gestão dos protocolos institucionais. Crie um protocolo e adicione as contas dos
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
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Temática *">
              <input
                value={form.tematica}
                onChange={(e) => setForm({ ...form, tematica: e.target.value })}
                className={inputCls}
              />
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
              <input
                type="date"
                value={form.data_assinatura}
                onChange={(e) => setForm({ ...form, data_assinatura: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Outorgantes *" className="md:col-span-2">
              <input
                value={form.outorgantes}
                onChange={(e) => setForm({ ...form, outorgantes: e.target.value })}
                placeholder="Ex: DGEEC, Universidade X"
                className={inputCls}
              />
            </Field>
            <Field label="Finalidade *" className="md:col-span-2">
              <textarea
                value={form.finalidade}
                onChange={(e) => setForm({ ...form, finalidade: e.target.value })}
                rows={3}
                className={inputCls}
              />
            </Field>
            <Field label="Observações" className="md:col-span-2">
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={2}
                className={inputCls}
              />
            </Field>
            <Field label="Protocolo (PDF)" className="md:col-span-2">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setForm({ ...form, pdf: e.target.files?.[0] ?? null })}
                className="block w-full text-sm text-on-surface file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-primary"
              />
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
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl">
        <div className="grid grid-cols-12 bg-surface-container px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          <div className="col-span-5">Protocolo</div>
          <div className="col-span-3">Temática</div>
          <div className="col-span-2">Assinatura</div>
          <div className="col-span-2">Estado</div>
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
            {protocolosQ.data!.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setOpenId(p.id)}
                  className="grid w-full grid-cols-12 items-center gap-3 px-5 py-4 text-left text-sm transition-colors hover:bg-surface-container-high"
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
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
                  <div className="col-span-2 flex items-center gap-2">
                    <StatusChip tone={p.estado === "ativo" ? "success" : "neutral"} dot>
                      {p.estado === "ativo" ? "Ativo" : "Inativo"}
                    </StatusChip>
                    <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <ProtocoloDrawer
          protocolo={open}
          onClose={() => setOpenId(null)}
          onToggleEstado={(estado) => toggleEstadoMut.mutate({ id: open.id, estado })}
        />
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg bg-surface-container-low px-3 py-2.5 text-sm text-on-surface shadow-tonal-sm outline outline-2 outline-transparent focus:outline-primary";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="label-eyebrow">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ProtocoloDrawer({
  protocolo,
  onClose,
  onToggleEstado,
}: {
  protocolo: ProtocoloRow;
  onClose: () => void;
  onToggleEstado: (estado: ProtocoloEstado) => void;
}) {
  const qc = useQueryClient();
  const createInvestigador = useServerFn(createInvestigadorForProtocolo);
  const [showInv, setShowInv] = useState(false);
  const [inv, setInv] = useState({
    fullName: "",
    email: "",
    password: "",
    institution: "",
    position: "Investigador",
  });

  const investigadoresQ = useQuery({
    queryKey: ["admin", "protocolo-investigadores", protocolo.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, institution, position")
        .eq("protocolo_id", protocolo.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InvestigadorRow[];
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

  const downloadPdf = async () => {
    if (!protocolo.protocolo_pdf_path) return;
    const { data, error } = await supabase.storage
      .from("protocolos")
      .createSignedUrl(protocolo.protocolo_pdf_path, 60);
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
          <button
            onClick={onClose}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-highest"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="label-eyebrow">Estado</p>
              <div className="mt-2 flex items-center gap-2">
                <StatusChip tone={protocolo.estado === "ativo" ? "success" : "neutral"} dot>
                  {protocolo.estado === "ativo" ? "Ativo" : "Inativo"}
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
            {protocolo.protocolo_pdf_path && (
              <div className="col-span-2">
                <button
                  onClick={downloadPdf}
                  className="inline-flex items-center gap-2 rounded-md bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface hover:opacity-90"
                >
                  <Download className="h-4 w-4" />
                  Descarregar PDF
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-surface-container-low p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-on-surface-variant" />
                <h4 className="font-display text-base font-bold text-on-surface">
                  Investigadores associados
                </h4>
              </div>
              <button
                onClick={() => setShowInv((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Novo
              </button>
            </div>

            {showInv && (
              <div className="mt-4 space-y-3 rounded-xl bg-surface-container-lowest p-4">
                <Field label="Nome completo *">
                  <input
                    value={inv.fullName}
                    onChange={(e) => setInv({ ...inv, fullName: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Email *">
                  <input
                    type="email"
                    value={inv.email}
                    onChange={(e) => setInv({ ...inv, email: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Password inicial (mín. 8) *">
                  <input
                    type="text"
                    value={inv.password}
                    onChange={(e) => setInv({ ...inv, password: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Instituição">
                  <input
                    value={inv.institution}
                    onChange={(e) => setInv({ ...inv, institution: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Cargo">
                  <input
                    value={inv.position}
                    onChange={(e) => setInv({ ...inv, position: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <div className="flex gap-2">
                  <button
                    onClick={() => createInvMut.mutate()}
                    disabled={createInvMut.isPending}
                    className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
                  >
                    {createInvMut.isPending ? "A criar…" : "Criar conta"}
                  </button>
                  <button
                    onClick={() => setShowInv(false)}
                    className="rounded-md px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4">
              {investigadoresQ.isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (investigadoresQ.data?.length ?? 0) === 0 ? (
                <p className="py-4 text-center text-sm text-on-surface-variant">
                  Sem investigadores associados.
                </p>
              ) : (
                <ul className="space-y-2">
                  {investigadoresQ.data!.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center gap-3 rounded-lg bg-surface-container-lowest p-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-on-surface">
                          {u.full_name || u.email}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">
                          {u.email} · {u.position ?? "Investigador"}
                        </p>
                      </div>
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
