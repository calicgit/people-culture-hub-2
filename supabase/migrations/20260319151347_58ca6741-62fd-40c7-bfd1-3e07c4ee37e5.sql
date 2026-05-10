-- Create meetup applications table
CREATE TABLE public.meetup_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  city_region TEXT NOT NULL,
  hr_role TEXT NOT NULL,
  motivation TEXT NOT NULL,
  preferred_format TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meetup_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit a meetup application"
  ON public.meetup_applications FOR INSERT
  WITH CHECK (true);

-- No public reads on applications
CREATE POLICY "No public reads on applications"
  ON public.meetup_applications FOR SELECT
  USING (false);