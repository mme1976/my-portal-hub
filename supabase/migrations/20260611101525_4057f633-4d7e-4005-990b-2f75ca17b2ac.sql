
CREATE POLICY "Admins manage protocolo pdfs"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'protocolos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'protocolos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Investigadores leem pdf do seu protocolo"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'protocolos'
  AND EXISTS (
    SELECT 1 FROM public.profiles pr
    JOIN public.protocolos p ON p.id = pr.protocolo_id
    WHERE pr.id = auth.uid() AND p.protocolo_pdf_path = storage.objects.name
  )
);
