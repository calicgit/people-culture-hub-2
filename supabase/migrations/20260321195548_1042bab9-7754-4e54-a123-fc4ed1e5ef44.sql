DROP POLICY IF EXISTS "Authenticated users can view DMS documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own DMS documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own DMS documents" ON storage.objects;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Authenticated users can view active member directory'
  ) THEN
    CREATE POLICY "Authenticated users can view active member directory"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_body_memberships' AND policyname = 'Authenticated users can view body memberships directory'
  ) THEN
    CREATE POLICY "Authenticated users can view body memberships directory"
    ON public.user_body_memberships
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can view permitted DMS files'
  ) THEN
    CREATE POLICY "Authenticated users can view permitted DMS files"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'dms-documents'
      AND EXISTS (
        SELECT 1
        FROM public.documents d
        WHERE d.file_path = name
          AND (
            public.has_role(auth.uid(), 'master_admin')
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
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can update permitted DMS files'
  ) THEN
    CREATE POLICY "Authenticated users can update permitted DMS files"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'dms-documents'
      AND EXISTS (
        SELECT 1
        FROM public.documents d
        WHERE d.file_path = name
          AND (public.has_role(auth.uid(), 'master_admin') OR d.uploaded_by = auth.uid())
      )
    )
    WITH CHECK (
      bucket_id = 'dms-documents'
      AND EXISTS (
        SELECT 1
        FROM public.documents d
        WHERE d.file_path = name
          AND (public.has_role(auth.uid(), 'master_admin') OR d.uploaded_by = auth.uid())
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can delete permitted DMS files'
  ) THEN
    CREATE POLICY "Authenticated users can delete permitted DMS files"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'dms-documents'
      AND EXISTS (
        SELECT 1
        FROM public.documents d
        WHERE d.file_path = name
          AND (public.has_role(auth.uid(), 'master_admin') OR d.uploaded_by = auth.uid())
      )
    );
  END IF;
END $$;