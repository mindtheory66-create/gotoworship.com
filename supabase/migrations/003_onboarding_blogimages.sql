-- Add onboarding flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Update trigger: default role = user, approved = true, onboarding = false.
-- Only pre-set admin accounts skip onboarding.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  chosen_role TEXT;
BEGIN
  chosen_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  IF chosen_role NOT IN ('user', 'contributor', 'admin') THEN
    chosen_role := 'user';
  END IF;

  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    organization,
    position,
    approved,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    CASE WHEN chosen_role = 'admin' THEN 'admin' ELSE 'user' END,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NULLIF(NEW.raw_user_meta_data->>'organization', ''),
    NULLIF(NEW.raw_user_meta_data->>'position', ''),
    CASE WHEN chosen_role = 'contributor' THEN false ELSE true END,
    CASE WHEN chosen_role = 'admin' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    organization = COALESCE(EXCLUDED.organization, public.profiles.organization),
    position = COALESCE(EXCLUDED.position, public.profiles.position),
    approved = EXCLUDED.approved,
    onboarding_completed = EXCLUDED.onboarding_completed;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing profiles: mark everyone who already has a concrete role
-- (admin/contributor) as onboarded so the popup only appears for fresh users.
UPDATE public.profiles
SET onboarding_completed = true
WHERE onboarding_completed = false
  AND role IN ('admin', 'contributor');

-- Storage bucket for blog featured images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for blog images
CREATE POLICY "Public can read blog-images"
ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');
