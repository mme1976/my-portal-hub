import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";

export interface ProtocoloLite {
  id: string;
  nome: string;
  estado: "ativo" | "inativo";
  data_terminus: string | null;
}

interface ProtocoloCtxValue {
  loading: boolean;
  protocolos: ProtocoloLite[];
  activeId: string | null;
  active: ProtocoloLite | null;
  /** true quando o protocolo ativo tem estado='ativo' e não expirou (data_terminus>=hoje ou nula). */
  isActiveProtocoloUsable: boolean;
  setActiveId: (id: string) => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<ProtocoloCtxValue | undefined>(undefined);

const LS_KEY = "dgeec.activeProtocoloId";

export function ProtocoloProvider({ children }: { children: ReactNode }) {
  const { user, hasRole, loading: authLoading } = useAuth();
  const isAdmin = hasRole("admin");

  const q = useQuery({
    queryKey: ["my-protocolos", user?.id ?? "none"],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      // Admin: vê todos os protocolos; investigador: só os que está associado
      if (isAdmin) {
        const { data, error } = await supabase
          .from("protocolos")
          .select("id, nome, estado, data_terminus")
          .order("nome");
        if (error) throw error;
        return (data ?? []) as ProtocoloLite[];
      }
      const { data, error } = await supabase
        .from("protocolo_membros")
        .select("protocolo:protocolos(id, nome, estado, data_terminus)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return ((data ?? []).map((r: any) => r.protocolo).filter(Boolean) as ProtocoloLite[]).sort(
        (a, b) => a.nome.localeCompare(b.nome),
      );
    },
  });

  const protocolos = q.data ?? [];

  const [activeId, setActiveIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(LS_KEY);
  });

  // Garantir que o activeId é válido
  useEffect(() => {
    if (!protocolos.length) return;
    if (!activeId || !protocolos.some((p) => p.id === activeId)) {
      const next = protocolos[0].id;
      setActiveIdState(next);
      if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, next);
    }
  }, [protocolos, activeId]);

  const setActiveId = (id: string) => {
    setActiveIdState(id);
    if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, id);
  };

  const value = useMemo<ProtocoloCtxValue>(
    () => ({
      loading: q.isLoading,
      protocolos,
      activeId,
      active: protocolos.find((p) => p.id === activeId) ?? null,
      setActiveId,
      refresh: async () => {
        await q.refetch();
      },
    }),
    [q.isLoading, protocolos, activeId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProtocolo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProtocolo deve estar dentro de <ProtocoloProvider>");
  return v;
}
