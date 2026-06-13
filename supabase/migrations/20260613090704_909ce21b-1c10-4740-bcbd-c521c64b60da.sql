
-- 1) Tabela de associação N:N investigador <-> protocolo
CREATE TABLE public.protocolo_membros (
  protocolo_id uuid NOT NULL REFERENCES public.protocolos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  PRIMARY KEY (protocolo_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocolo_membros TO authenticated;
GRANT ALL ON public.protocolo_membros TO service_role;

ALTER TABLE public.protocolo_membros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage protocolo_membros"
  ON public.protocolo_membros FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Members read their own memberships"
  ON public.protocolo_membros FOR SELECT
  USING (user_id = auth.uid());

CREATE INDEX idx_protocolo_membros_user ON public.protocolo_membros(user_id);
CREATE INDEX idx_protocolo_membros_proto ON public.protocolo_membros(protocolo_id);

-- 2) Migrar associações já existentes em profiles.protocolo_id
INSERT INTO public.protocolo_membros (protocolo_id, user_id)
SELECT protocolo_id, id FROM public.profiles
WHERE protocolo_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3) Helper SECURITY DEFINER para uso em RLS sem recursão
CREATE OR REPLACE FUNCTION public.is_protocolo_member(_user_id uuid, _protocolo_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.protocolo_membros
    WHERE user_id = _user_id AND protocolo_id = _protocolo_id
  )
$$;

-- 4) Adicionar protocolo_id em pedidos e reservas para scoping
ALTER TABLE public.pedidos_dataset ADD COLUMN IF NOT EXISTS protocolo_id uuid REFERENCES public.protocolos(id) ON DELETE SET NULL;
ALTER TABLE public.reservas        ADD COLUMN IF NOT EXISTS protocolo_id uuid REFERENCES public.protocolos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_protocolo ON public.pedidos_dataset(protocolo_id);
CREATE INDEX IF NOT EXISTS idx_reservas_protocolo ON public.reservas(protocolo_id);

-- Backfill: tagar registos antigos com o protocolo do dono (se houver apenas um)
UPDATE public.pedidos_dataset p
   SET protocolo_id = pr.protocolo_id
  FROM public.profiles pr
 WHERE p.protocolo_id IS NULL AND pr.id = p.user_id AND pr.protocolo_id IS NOT NULL;

UPDATE public.reservas r
   SET protocolo_id = pr.protocolo_id
  FROM public.profiles pr
 WHERE r.protocolo_id IS NULL AND pr.id = r.user_id AND pr.protocolo_id IS NOT NULL;

-- 5) Atualizar políticas RLS: membros do protocolo podem ver tudo do protocolo

-- pedidos_dataset: substitui "Users view own pedidos" por scope de protocolo
DROP POLICY IF EXISTS "Users view own pedidos" ON public.pedidos_dataset;
CREATE POLICY "Members view pedidos do protocolo"
  ON public.pedidos_dataset FOR SELECT
  USING (
    auth.uid() = user_id
    OR (protocolo_id IS NOT NULL AND public.is_protocolo_member(auth.uid(), protocolo_id))
  );

-- reservas: substitui "Users can view own reservas" por scope de protocolo
DROP POLICY IF EXISTS "Users can view own reservas" ON public.reservas;
CREATE POLICY "Members view reservas do protocolo"
  ON public.reservas FOR SELECT
  USING (
    auth.uid() = user_id
    OR (protocolo_id IS NOT NULL AND public.is_protocolo_member(auth.uid(), protocolo_id))
  );

-- pedidos_historico: permitir ler histórico de pedidos visíveis ao utilizador
DROP POLICY IF EXISTS "Users view historico of own pedidos" ON public.pedidos_historico;
CREATE POLICY "Members view historico do protocolo"
  ON public.pedidos_historico FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos_dataset p
      WHERE p.id = pedido_id
        AND (
          p.user_id = auth.uid()
          OR (p.protocolo_id IS NOT NULL AND public.is_protocolo_member(auth.uid(), p.protocolo_id))
        )
    )
  );

-- protocolos: substituir a política antiga (que usava profiles.protocolo_id) pela nova
DROP POLICY IF EXISTS "Investigadores leem o seu protocolo" ON public.protocolos;
CREATE POLICY "Membros leem os seus protocolos"
  ON public.protocolos FOR SELECT
  USING (public.is_protocolo_member(auth.uid(), id));

-- profiles: permitir aos membros do mesmo protocolo verem nome/email dos colegas
CREATE POLICY "Members view colegas do protocolo"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.protocolo_membros m1
      JOIN public.protocolo_membros m2 ON m1.protocolo_id = m2.protocolo_id
      WHERE m1.user_id = auth.uid() AND m2.user_id = profiles.id
    )
  );
