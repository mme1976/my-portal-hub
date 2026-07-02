
-- 1) Add data_terminus to protocolos
ALTER TABLE public.protocolos ADD COLUMN IF NOT EXISTS data_terminus DATE;

-- 2) Helper: protocolo ativo (estado 'ativo' e não expirado)
CREATE OR REPLACE FUNCTION public.is_protocolo_ativo(_protocolo_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.protocolos
    WHERE id = _protocolo_id
      AND estado = 'ativo'
      AND (data_terminus IS NULL OR data_terminus >= CURRENT_DATE)
  )
$$;

-- 3) Endurecer INSERT policies: exige protocolo ativo (admins isentos)
DROP POLICY IF EXISTS "Users create own pedidos" ON public.pedidos_dataset;
CREATE POLICY "Users create own pedidos" ON public.pedidos_dataset
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.has_role(auth.uid(), 'admin')
    OR (
      protocolo_id IS NOT NULL
      AND public.is_protocolo_member(auth.uid(), protocolo_id)
      AND public.is_protocolo_ativo(protocolo_id)
    )
  )
);

DROP POLICY IF EXISTS "Users can create own reservas" ON public.reservas;
CREATE POLICY "Users can create own reservas" ON public.reservas
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.has_role(auth.uid(), 'admin')
    OR (
      protocolo_id IS NOT NULL
      AND public.is_protocolo_member(auth.uid(), protocolo_id)
      AND public.is_protocolo_ativo(protocolo_id)
    )
  )
);

-- 4) protocolo_documentos: múltiplos documentos por protocolo
CREATE TABLE IF NOT EXISTS public.protocolo_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo_id UUID NOT NULL REFERENCES public.protocolos(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  size_bytes BIGINT,
  descricao TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocolo_documentos TO authenticated;
GRANT ALL ON public.protocolo_documentos TO service_role;

ALTER TABLE public.protocolo_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerem docs protocolo"
ON public.protocolo_documentos FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Membros veem docs do protocolo"
ON public.protocolo_documentos FOR SELECT
USING (public.is_protocolo_member(auth.uid(), protocolo_id));

CREATE INDEX IF NOT EXISTS idx_protocolo_docs_prot ON public.protocolo_documentos(protocolo_id);

-- 5) pedido_ficheiros_finais: ficheiros finais anexados pela administração
CREATE TABLE IF NOT EXISTS public.pedido_ficheiros_finais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos_dataset(id) ON DELETE CASCADE,
  protocolo_id UUID REFERENCES public.protocolos(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  size_bytes BIGINT,
  descricao TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_ficheiros_finais TO authenticated;
GRANT ALL ON public.pedido_ficheiros_finais TO service_role;

ALTER TABLE public.pedido_ficheiros_finais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerem ficheiros finais"
ON public.pedido_ficheiros_finais FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Membros descarregam ficheiros finais do protocolo"
ON public.pedido_ficheiros_finais FOR SELECT
USING (protocolo_id IS NOT NULL AND public.is_protocolo_member(auth.uid(), protocolo_id));

CREATE INDEX IF NOT EXISTS idx_final_files_pedido ON public.pedido_ficheiros_finais(pedido_id);
CREATE INDEX IF NOT EXISTS idx_final_files_prot ON public.pedido_ficheiros_finais(protocolo_id);

-- 6) Storage policies para bucket 'protocolos' (docs de protocolo)
DROP POLICY IF EXISTS "Admins gerem objs protocolos" ON storage.objects;
CREATE POLICY "Admins gerem objs protocolos" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'protocolos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'protocolos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Membros leem objs protocolos" ON storage.objects;
CREATE POLICY "Membros leem objs protocolos" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'protocolos' AND EXISTS (
    SELECT 1 FROM public.protocolo_documentos d
    WHERE d.storage_path = storage.objects.name
      AND public.is_protocolo_member(auth.uid(), d.protocolo_id)
  )
);

-- 7) Storage policies para bucket 'trabalhos-finais' (será criado via tool)
DROP POLICY IF EXISTS "Admins gerem trabalhos finais" ON storage.objects;
CREATE POLICY "Admins gerem trabalhos finais" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'trabalhos-finais' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'trabalhos-finais' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Membros leem trabalhos finais" ON storage.objects;
CREATE POLICY "Membros leem trabalhos finais" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'trabalhos-finais' AND EXISTS (
    SELECT 1 FROM public.pedido_ficheiros_finais f
    WHERE f.storage_path = storage.objects.name
      AND f.protocolo_id IS NOT NULL
      AND public.is_protocolo_member(auth.uid(), f.protocolo_id)
  )
);
