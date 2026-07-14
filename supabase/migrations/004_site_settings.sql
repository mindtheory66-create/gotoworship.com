-- Site-wide configurable HTML snippets (header scripts, ad banners, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON public.site_settings(category);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Seed default keys used by the application. Values are empty by default.
INSERT INTO public.site_settings (key, value, category)
VALUES
  ('header_code', '', 'scripts'),
  ('banner_below_header', '', 'ads'),
  ('banner_sidebar', '', 'ads')
ON CONFLICT (key) DO NOTHING;
