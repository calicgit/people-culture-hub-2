CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  uploaded_by UUID NOT NULL,
  visibility_body public.association_body,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_by UUID NOT NULL,
  visibility_body public.association_body,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_calendar_event_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ends_at < NEW.starts_at THEN
    RAISE EXCEPTION 'Event end time must be after start time';
  END IF;
  RETURN NEW;
END;
$$;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_documents_updated_at'
  ) THEN
    CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_calendar_events_updated_at'
  ) THEN
    CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'validate_calendar_event_dates_trigger'
  ) THEN
    CREATE TRIGGER validate_calendar_event_dates_trigger
    BEFORE INSERT OR UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_calendar_event_dates();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Authenticated users can view allowed documents'
  ) THEN
    CREATE POLICY "Authenticated users can view allowed documents"
    ON public.documents
    FOR SELECT
    TO authenticated
    USING (
      public.has_role(auth.uid(), 'master_admin')
      OR uploaded_by = auth.uid()
      OR visibility_body IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.user_body_memberships ubm
        WHERE ubm.user_id = auth.uid()
          AND ubm.body = visibility_body
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Authenticated users can insert documents'
  ) THEN
    CREATE POLICY "Authenticated users can insert documents"
    ON public.documents
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = uploaded_by
      AND (
        public.has_role(auth.uid(), 'master_admin')
        OR visibility_body IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.user_body_memberships ubm
          WHERE ubm.user_id = auth.uid()
            AND ubm.body = visibility_body
        )
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Users can update own documents or admin all'
  ) THEN
    CREATE POLICY "Users can update own documents or admin all"
    ON public.documents
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'master_admin') OR uploaded_by = auth.uid())
    WITH CHECK (public.has_role(auth.uid(), 'master_admin') OR uploaded_by = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Users can delete own documents or admin all'
  ) THEN
    CREATE POLICY "Users can delete own documents or admin all"
    ON public.documents
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'master_admin') OR uploaded_by = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'calendar_events' AND policyname = 'Authenticated users can view allowed calendar events'
  ) THEN
    CREATE POLICY "Authenticated users can view allowed calendar events"
    ON public.calendar_events
    FOR SELECT
    TO authenticated
    USING (
      public.has_role(auth.uid(), 'master_admin')
      OR created_by = auth.uid()
      OR visibility_body IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.user_body_memberships ubm
        WHERE ubm.user_id = auth.uid()
          AND ubm.body = visibility_body
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'calendar_events' AND policyname = 'Authenticated users can insert calendar events'
  ) THEN
    CREATE POLICY "Authenticated users can insert calendar events"
    ON public.calendar_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = created_by
      AND (
        public.has_role(auth.uid(), 'master_admin')
        OR visibility_body IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.user_body_memberships ubm
          WHERE ubm.user_id = auth.uid()
            AND ubm.body = visibility_body
        )
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'calendar_events' AND policyname = 'Users can update own events or admin all'
  ) THEN
    CREATE POLICY "Users can update own events or admin all"
    ON public.calendar_events
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'master_admin') OR created_by = auth.uid())
    WITH CHECK (public.has_role(auth.uid(), 'master_admin') OR created_by = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'calendar_events' AND policyname = 'Users can delete own events or admin all'
  ) THEN
    CREATE POLICY "Users can delete own events or admin all"
    ON public.calendar_events
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'master_admin') OR created_by = auth.uid());
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
SELECT 'dms-documents', 'dms-documents', false
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'dms-documents'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can view DMS documents'
  ) THEN
    CREATE POLICY "Authenticated users can view DMS documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'dms-documents');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload DMS documents'
  ) THEN
    CREATE POLICY "Authenticated users can upload DMS documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'dms-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can update own DMS documents'
  ) THEN
    CREATE POLICY "Authenticated users can update own DMS documents"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'dms-documents' AND auth.uid()::text = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = 'dms-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can delete own DMS documents'
  ) THEN
    CREATE POLICY "Authenticated users can delete own DMS documents"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'dms-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;