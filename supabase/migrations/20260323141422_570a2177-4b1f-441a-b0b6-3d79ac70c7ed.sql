
CREATE TABLE public.custom_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view custom sections"
  ON public.custom_sections FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Master admins can manage custom sections"
  ON public.custom_sections FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));
