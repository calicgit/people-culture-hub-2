
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  council TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  photo_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT TO public USING (true);

CREATE POLICY "Master admins can manage team members"
  ON public.team_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'master_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'master_admin'));

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
