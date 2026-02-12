
-- Add profile fields for onboarding
ALTER TABLE public.profiles 
  ADD COLUMN first_name text NOT NULL DEFAULT '',
  ADD COLUMN last_name text NOT NULL DEFAULT '',
  ADD COLUMN business_address text NOT NULL DEFAULT '',
  ADD COLUMN business_type text NOT NULL DEFAULT '',
  ADD COLUMN profile_completed boolean NOT NULL DEFAULT false;
