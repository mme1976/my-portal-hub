import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { Loader2, Clock, ShieldOff, LogOut } from "lucide-react";
import { authSnapshot, useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/integrations/supabase/client";
import logoUrl from "@/assets/dgeec-logo.png";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    if (!authSnapshot.loading && !authSnapshot.isAuthenticated) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
  },
  component: AuthenticatedGate,
});

function AuthenticatedGate() {
  const { loading, profile, accountStatus, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Admins always pass through (segurança: não bloquear administradores).
  if (hasRole("admin")) return <Outlet />;

  // Profile may still be loading on cold session — let it through to avoid flash.
  if (!profile) return <Outlet />;

  if (accountStatus === "pendente") {
    return <PendingScreen />;
  }
  if (accountStatus === "rejeitado") {
    return <RejectedScreen motivo={profile.motivo_rejeicao ?? null} />;
  }

  return <Outlet />;
}

function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoUrl} alt="DGEEC SafeCenter" width={1024} height={1024} className="h-11 w-11 rounded-full" />
          <div>
            <p className="font-display text-sm font-extrabold leading-none">DGEEC</p>
            <p className="font-display text-sm font-extrabold leading-tight">SafeCenter</p>
          </div>
        </Link>
        <div className="mt-12">{children}</div>
      </div>
    </div>
  );
}

function PendingScreen() {
  return (
    <ScreenShell>
      <div className="rounded-3xl bg-surface-container-low p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-container text-on-warning-container">
          <Clock className="h-5 w-5" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold text-on-surface">
          A sua conta está em análise
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          O seu pedido de registo foi recebido. Um administrador do DGEEC SafeCenter irá
          verificar a sua afiliação institucional e aprovar a conta dentro de poucos dias úteis.
          Receberá uma notificação assim que tiver acesso.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/auth";
          }}
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-surface-container-highest px-5 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-high"
        >
          <LogOut className="h-4 w-4" />
          Terminar sessão
        </button>
      </div>
    </ScreenShell>
  );
}

function RejectedScreen({ motivo }: { motivo: string | null }) {
  return (
    <ScreenShell>
      <div className="rounded-3xl bg-surface-container-low p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container text-on-error-container">
          <ShieldOff className="h-5 w-5" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold text-on-surface">
          Pedido de registo recusado
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          O acesso ao portal não foi autorizado.
        </p>
        {motivo && (
          <div className="mt-4 rounded-lg bg-error-container/40 p-4 text-sm text-on-error-container">
            <p className="label-eyebrow !text-on-error-container">Motivo indicado</p>
            <p className="mt-2">{motivo}</p>
          </div>
        )}
        <p className="mt-4 text-sm text-on-surface-variant">
          Se considera que se trata de um engano, contacte{" "}
          <a href="mailto:safecentre@dgeec.pt" className="font-semibold text-primary hover:underline">
            safecentre@dgeec.pt
          </a>
          .
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/auth";
          }}
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-surface-container-highest px-5 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-high"
        >
          <LogOut className="h-4 w-4" />
          Terminar sessão
        </button>
      </div>
    </ScreenShell>
  );
}
