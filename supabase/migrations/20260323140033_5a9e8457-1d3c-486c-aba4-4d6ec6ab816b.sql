
CREATE TYPE public.membership_type AS ENUM ('redovni', 'pocasni');

CREATE TABLE public.association_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NULL,
  gender text NULL,
  country text NULL,
  oib text NULL,
  phone text NULL,
  email text NULL,
  address text NULL,
  city text NULL,
  postal_code text NULL,
  membership_type membership_type NOT NULL DEFAULT 'redovni',
  activation_date date NOT NULL DEFAULT CURRENT_DATE,
  deactivation_date date NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.association_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view association members"
  ON public.association_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Master admins can insert association members"
  ON public.association_members FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master admins can update association members"
  ON public.association_members FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master admins can delete association members"
  ON public.association_members FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role));
