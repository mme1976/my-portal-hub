import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createInvestigadorSchema = z.object({
  email: z.string().trim().email().max(255),
  fullName: z.string().trim().min(2).max(255),
  password: z.string().min(8).max(128),
  institution: z.string().trim().max(255).optional().nullable(),
  position: z.string().trim().max(255).optional().nullable(),
  protocoloId: z.string().uuid(),
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (roleErr) throw new Error("Erro a validar permissões");
  if (!isAdmin) throw new Error("Apenas administradores podem executar esta operação");
}

export const createInvestigadorForProtocolo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createInvestigadorSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: protocolo, error: protoErr } = await supabaseAdmin
      .from("protocolos")
      .select("id")
      .eq("id", data.protocoloId)
      .maybeSingle();
    if (protoErr || !protocolo) throw new Error("Protocolo não encontrado");

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        institution: data.institution ?? null,
        position: data.position ?? "Investigador",
      },
    });
    if (createErr || !created?.user) {
      throw new Error(createErr?.message ?? "Falha ao criar utilizador");
    }
    const newUserId = created.user.id;

    const { error: updErr } = await supabaseAdmin
      .from("profiles")
      .update({
        account_status: "aprovado",
        approved_at: new Date().toISOString(),
        approved_by: context.userId,
        institution: data.institution ?? null,
        position: data.position ?? "Investigador",
        full_name: data.fullName,
      })
      .eq("id", newUserId);
    if (updErr) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error("Falha ao atualizar perfil: " + updErr.message);
    }

    const { error: memberErr } = await supabaseAdmin
      .from("protocolo_membros")
      .insert({ protocolo_id: data.protocoloId, user_id: newUserId, created_by: context.userId });
    if (memberErr) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error("Falha ao associar protocolo: " + memberErr.message);
    }

    return { userId: newUserId, email: data.email };
  });

const addExistingSchema = z.object({
  email: z.string().trim().email().max(255),
  protocoloId: z.string().uuid(),
});

export const addExistingInvestigadorToProtocolo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => addExistingSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .ilike("email", data.email)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!profile) throw new Error("Não existe um investigador com esse email");

    const { error: insErr } = await supabaseAdmin
      .from("protocolo_membros")
      .insert({ protocolo_id: data.protocoloId, user_id: profile.id, created_by: context.userId });
    if (insErr) {
      if (insErr.code === "23505") throw new Error("Esse investigador já está associado a este protocolo");
      throw new Error(insErr.message);
    }
    return { userId: profile.id, email: profile.email, fullName: profile.full_name };
  });

const setMembershipsSchema = z.object({
  userId: z.string().uuid(),
  protocoloIds: z.array(z.string().uuid()).min(1),
});

export const setInvestigadorProtocolos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => setMembershipsSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Replace memberships
    const { error: delErr } = await supabaseAdmin
      .from("protocolo_membros")
      .delete()
      .eq("user_id", data.userId);
    if (delErr) throw new Error(delErr.message);

    const rows = data.protocoloIds.map((pid) => ({
      protocolo_id: pid,
      user_id: data.userId,
      created_by: context.userId,
    }));
    const { error: insErr } = await supabaseAdmin.from("protocolo_membros").insert(rows);
    if (insErr) throw new Error(insErr.message);

    return { count: rows.length };
  });

const removeMemberSchema = z.object({
  userId: z.string().uuid(),
  protocoloId: z.string().uuid(),
});

export const removeInvestigadorFromProtocolo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => removeMemberSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("protocolo_membros")
      .delete()
      .eq("user_id", data.userId)
      .eq("protocolo_id", data.protocoloId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
