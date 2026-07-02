
-- is_protocolo_ativo: os utilizadores autenticados só verão o protocolo se forem membros (SELECT policy),
-- e as INSERT policies exigem membership antes de chamar esta função. INVOKER é seguro e evita o warning.
CREATE OR REPLACE FUNCTION public.is_protocolo_ativo(_protocolo_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.protocolos
    WHERE id = _protocolo_id
      AND estado = 'ativo'
      AND (data_terminus IS NULL OR data_terminus >= CURRENT_DATE)
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_protocolo_ativo(uuid) FROM anon;
