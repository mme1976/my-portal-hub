
-- ============= ENUMS =============
CREATE TYPE public.pedido_status AS ENUM (
  'submetido',
  'em_analise',
  'pedido_esclarecimento',
  'aprovado',
  'rejeitado',
  'em_anonimizacao',
  'concluido'
);

CREATE TYPE public.account_status AS ENUM (
  'pendente',
  'aprovado',
  'rejeitado'
);

-- ============= PROFILES: account status =============
ALTER TABLE public.profiles
  ADD COLUMN account_status public.account_status NOT NULL DEFAULT 'pendente',
  ADD COLUMN motivo_rejeicao TEXT,
  ADD COLUMN approved_at TIMESTAMPTZ,
  ADD COLUMN approved_by UUID;

-- Existing users (already created) -> mark as approved so they keep access
UPDATE public.profiles SET account_status = 'aprovado', approved_at = now();

-- New signups must default to 'pendente' (already covered by column default)
-- Update the handle_new_user trigger to keep default behavior (no change needed since default applies)

-- Allow admins to view & update any profile (for approval workflow)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= PEDIDOS DE DATASET =============
CREATE TABLE public.pedidos_dataset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  titulo_estudo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  dados_pretendidos TEXT NOT NULL,
  finalidade TEXT NOT NULL,
  status public.pedido_status NOT NULL DEFAULT 'submetido',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos_dataset ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pedidos"
ON public.pedidos_dataset FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users create own pedidos"
ON public.pedidos_dataset FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all pedidos"
ON public.pedidos_dataset FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_pedidos_dataset_updated
BEFORE UPDATE ON public.pedidos_dataset
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Histórico de alterações de estado
CREATE TABLE public.pedidos_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos_dataset(id) ON DELETE CASCADE,
  status_anterior public.pedido_status,
  status_novo public.pedido_status NOT NULL,
  alterado_por UUID NOT NULL,
  nota TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pedido historico"
ON public.pedidos_historico FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.pedidos_dataset p
  WHERE p.id = pedido_id AND p.user_id = auth.uid()
));

CREATE POLICY "Admins manage historico"
ON public.pedidos_historico FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= HOMEPAGE: HERO =============
CREATE TABLE public.homepage_hero (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  subtitulo TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.homepage_hero ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hero" ON public.homepage_hero FOR SELECT USING (true);
CREATE POLICY "Admins manage hero" ON public.homepage_hero FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.homepage_hero (titulo, subtitulo) VALUES
  ('Centro de Investigação Estatística', 'Acesso seguro a microdados estatísticos para investigação científica em ambiente controlado no Safe Centre.');

-- ============= HOMEPAGE: AVISOS =============
CREATE TABLE public.homepage_avisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_fim DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_avisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active avisos" ON public.homepage_avisos FOR SELECT
USING (ativo = true AND (data_fim IS NULL OR data_fim >= CURRENT_DATE));
CREATE POLICY "Admins manage avisos" ON public.homepage_avisos FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= HOMEPAGE: DATASETS EM DESTAQUE =============
CREATE TABLE public.homepage_datasets_destaque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_datasets_destaque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active datasets destaque" ON public.homepage_datasets_destaque
FOR SELECT USING (ativo = true);
CREATE POLICY "Admins manage datasets destaque" ON public.homepage_datasets_destaque FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= HOMEPAGE: CONTACTOS =============
CREATE TABLE public.homepage_contactos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  morada TEXT,
  email TEXT,
  telefone TEXT,
  horario TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_contactos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contactos" ON public.homepage_contactos FOR SELECT USING (true);
CREATE POLICY "Admins manage contactos" ON public.homepage_contactos FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.homepage_contactos (morada, email, telefone, horario) VALUES
  ('Safe Centre — DGEEC, Av. 24 de Julho, Lisboa', 'safecentre@dgeec.pt', '+351 21 000 0000', 'Segunda a Sexta, 09:00–17:00');
