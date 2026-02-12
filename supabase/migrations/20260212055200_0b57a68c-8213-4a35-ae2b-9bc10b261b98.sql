
-- Create storage bucket for company branding assets
INSERT INTO storage.buckets (id, name, public) VALUES ('company-branding', 'company-branding', true);

-- Users can upload their own branding files
CREATE POLICY "Users can upload their own branding"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-branding' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own branding files
CREATE POLICY "Users can update their own branding"
ON storage.objects FOR UPDATE
USING (bucket_id = 'company-branding' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own branding files
CREATE POLICY "Users can delete their own branding"
ON storage.objects FOR DELETE
USING (bucket_id = 'company-branding' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Branding images are publicly readable (for invoice PDFs)
CREATE POLICY "Branding images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-branding');

-- Add columns to profiles for branding URLs
ALTER TABLE public.profiles
ADD COLUMN company_logo_url text NOT NULL DEFAULT '',
ADD COLUMN company_banner_url text NOT NULL DEFAULT '';
