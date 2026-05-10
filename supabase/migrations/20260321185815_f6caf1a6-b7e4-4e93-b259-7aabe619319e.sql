DROP POLICY IF EXISTS "Anyone can submit a meetup application" ON public.meetup_applications;

CREATE POLICY "Public can submit valid meetup applications"
ON public.meetup_applications
FOR INSERT
TO public
WITH CHECK (
  status = 'pending'
  AND length(trim(full_name)) BETWEEN 2 AND 120
  AND length(trim(email)) BETWEEN 5 AND 255
  AND position('@' in email) > 1
  AND length(trim(city_region)) BETWEEN 2 AND 120
  AND length(trim(hr_role)) BETWEEN 2 AND 120
  AND length(trim(motivation)) BETWEEN 10 AND 2000
  AND (organization IS NULL OR length(trim(organization)) BETWEEN 2 AND 160)
  AND (preferred_format IS NULL OR length(trim(preferred_format)) BETWEEN 2 AND 80)
);