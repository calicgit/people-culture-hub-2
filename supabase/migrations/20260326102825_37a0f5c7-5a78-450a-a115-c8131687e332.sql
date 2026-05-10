
CREATE TABLE public.membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  company text,
  membership_tier text NOT NULL,
  referrals text[] DEFAULT '{}',
  how_heard text,
  paid_by text NOT NULL,
  payer_company_name text,
  payer_full_name text,
  payer_address text,
  payer_oib text,
  applicant_oib text,
  applicant_date_of_birth date,
  invoice_email text,
  status text NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit membership applications"
  ON public.membership_applications
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'pending'
    AND length(trim(first_name)) >= 1
    AND length(trim(last_name)) >= 1
    AND length(trim(email)) >= 5
    AND position('@' in email) > 1
  );

CREATE POLICY "No public reads on membership applications"
  ON public.membership_applications
  FOR SELECT
  TO public
  USING (false);

CREATE POLICY "Master admins can manage membership applications"
  ON public.membership_applications
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));
