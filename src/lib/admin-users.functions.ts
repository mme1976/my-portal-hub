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

export const createInvestigadorForProtocolo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createInvestigadorSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Authorize: only admins can create investigator accounts
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error("Erro a validar permissões");
    if (!isAdmin) throw new Error("Apenas administradores podem criar contas");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Verify protocolo exists
    const { data: protocolo, error: protoErr } = await supabaseAdmin
      .from("protocolos")
      .select("id, nome")
      .eq("id", data.protocoloId)
      .maybeSingle();
    if (protoErr || !protocolo) throw new Error("Protocolo não encontrado");

    // Create user (email-confirmed)
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

    // The handle_new_user trigger inserts profile + role. Update profile to
    // attach protocolo and auto-approve account.
    const { error: updErr } = await supabaseAdmin
      .from("profiles")
      .update({
        protocolo_id: data.protocoloId,
        account_status: "aprovado",
        approved_at: new Date().toISOString(),
        approved_by: context.userId,
        institution: data.institution ?? null,
        position: data.position ?? "Investigador",
        full_name: data.fullName,
      })
      .eq("id", newUserId);
    if (updErr) {
      // best-effort cleanup
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error("Falha ao associar protocolo ao utilizador: " + updErr.message);
    }

    return { userId: newUserId, email: data.email };
  });
