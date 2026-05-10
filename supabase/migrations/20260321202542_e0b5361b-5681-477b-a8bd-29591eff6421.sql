CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT document_versions_version_positive CHECK (version_number > 0),
  CONSTRAINT document_versions_unique_version UNIQUE (document_id, version_number)
);

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view allowed document versions"
ON public.document_versions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.documents d
    WHERE d.id = document_versions.document_id
      AND (
        public.has_role(auth.uid(), 'master_admin'::public.app_role)
        OR d.uploaded_by = auth.uid()
        OR d.visibility_body IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.user_body_memberships ubm
          WHERE ubm.user_id = auth.uid()
            AND ubm.body = d.visibility_body
        )
      )
  )
);

CREATE POLICY "Authenticated users can insert allowed document versions"
ON public.document_versions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1
    FROM public.documents d
    WHERE d.id = document_versions.document_id
      AND (
        public.has_role(auth.uid(), 'master_admin'::public.app_role)
        OR d.uploaded_by = auth.uid()
      )
  )
);

CREATE POLICY "Users can delete own document versions or admin all"
ON public.document_versions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.documents d
    WHERE d.id = document_versions.document_id
      AND (
        public.has_role(auth.uid(), 'master_admin'::public.app_role)
        OR d.uploaded_by = auth.uid()
      )
  )
);

CREATE TABLE public.document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view allowed document comments"
ON public.document_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.documents d
    WHERE d.id = document_comments.document_id
      AND (
        public.has_role(auth.uid(), 'master_admin'::public.app_role)
        OR d.uploaded_by = auth.uid()
        OR d.visibility_body IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.user_body_memberships ubm
          WHERE ubm.user_id = auth.uid()
            AND ubm.body = d.visibility_body
        )
      )
  )
);

CREATE POLICY "Authenticated users can create allowed document comments"
ON public.document_comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id
  AND length(trim(body)) >= 1
  AND length(trim(body)) <= 2000
  AND EXISTS (
    SELECT 1
    FROM public.documents d
    WHERE d.id = document_comments.document_id
      AND (
        public.has_role(auth.uid(), 'master_admin'::public.app_role)
        OR d.uploaded_by = auth.uid()
        OR d.visibility_body IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.user_body_memberships ubm
          WHERE ubm.user_id = auth.uid()
            AND ubm.body = d.visibility_body
        )
      )
  )
);

CREATE POLICY "Users can update own comments or admin all"
ON public.document_comments
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
  OR auth.uid() = author_id
)
WITH CHECK (
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
  OR auth.uid() = author_id
);

CREATE POLICY "Users can delete own comments or admin all"
ON public.document_comments
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
  OR auth.uid() = author_id
);

CREATE TRIGGER update_document_comments_updated_at
BEFORE UPDATE ON public.document_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.document_comments;