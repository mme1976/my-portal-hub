import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AccountStatus = "pendente" | "aprovado" | "rejeitado";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  institution: string | null;
  position: string | null;
  account_status?: AccountStatus;
  motivo_rejeicao?: string | null;
}

export type AppRole = "admin" | "investigador";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  isAuthenticated: boolean;
  accountStatus: AccountStatus | null;
  hasRole: (role: AppRole) => boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Mutable snapshot consulted by route `beforeLoad` guards (which run outside React).
export const authSnapshot: { isAuthenticated: boolean; loading: boolean } = {
  isAuthenticated: false,
  loading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileAndRoles = async (userId: string) => {
    const [{ data: profileData }, { data: rolesData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile(profileData ?? null);
    setRoles((rolesData ?? []).map((r) => r.role as AppRole));
  };

  useEffect(() => {
    // Subscribe FIRST, then read existing session
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      authSnapshot.isAuthenticated = !!newSession;
      if (newSession?.user) {
        // Defer DB calls to avoid deadlock with auth state callback
        setTimeout(() => {
          void loadProfileAndRoles(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      authSnapshot.isAuthenticated = !!data.session;
      if (data.session?.user) {
        void loadProfileAndRoles(data.session.user.id).finally(() => {
          setLoading(false);
          authSnapshot.loading = false;
        });
      } else {
        setLoading(false);
        authSnapshot.loading = false;
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    roles,
    loading,
    isAuthenticated: !!session,
    accountStatus: profile?.account_status ?? null,
    hasRole: (role) => roles.includes(role),
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refreshProfile: async () => {
      if (session?.user) await loadProfileAndRoles(session.user.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
