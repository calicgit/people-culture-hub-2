INSERT INTO storage.buckets (id, name, public) VALUES ('team-photos', 'team-photos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read team photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'team-photos');
CREATE POLICY "Auth insert team photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'team-photos');