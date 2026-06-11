
CREATE TYPE public.protocolo_estado AS ENUM ('ativo', 'inativo');

CREATE TABLE public.protocolos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  estado public.protocolo_estado NOT NULL DEFAULT 'ativo',
  tematica TEXT NOT NULL,
  data_assinatura DATE NOT NULL,
  outorgantes TEXT NOT NULL,
  finalidade TEXT NOT NULL,
  observacoes TEXT,
  protocolo_pdf_path TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
ADD COLUMN protocolo_id UUID REFERENCES public.protocolos(id) ON DELETE SET NULL;

CREATE INDEX idx_profiles_protocolo_id ON public.profiles(protocolo_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocolos TO authenticated;
GRANT ALL ON public.protocolos TO service_role;

ALTER TABLE public.protocolos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage protocolos"
ON public.protocolos FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Investigadores leem o seu protocolo"
ON public.protocolos FOR SELECT TO authenticated
USING (id IN (SELECT protocolo_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE TRIGGER update_protocolos_updated_at
BEFORE UPDATE ON public.protocolos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
