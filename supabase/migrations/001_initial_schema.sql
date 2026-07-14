-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'contributor', 'admin')),
  full_name TEXT,
  organization TEXT,
  position TEXT,
  bio TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Places table
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  religion TEXT NOT NULL,
  denomination TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  language TEXT[] DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  schedule_notes JSONB DEFAULT '{}',
  transport_info JSONB DEFAULT '{}',
  content_long TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ai_generated', 'published')),
  featured_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Place images
CREATE TABLE IF NOT EXISTS public.place_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ai_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User bookmarks
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, place_id)
);

-- Blog categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Static pages
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_places_status ON public.places(status);
CREATE INDEX IF NOT EXISTS idx_places_city_state ON public.places(city, state);
CREATE INDEX IF NOT EXISTS idx_places_religion ON public.places(religion);
CREATE INDEX IF NOT EXISTS idx_places_slug ON public.places(slug);
CREATE INDEX IF NOT EXISTS idx_events_place_id ON public.events(place_id);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON public.events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_place_images_place_id ON public.place_images(place_id);

-- Full text search on places
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(address, '') || ' ' || COALESCE(city, '') || ' ' || COALESCE(state, '') || ' ' || COALESCE(religion, '') || ' ' || COALESCE(denomination, ''))
  ) STORED;
CREATE INDEX IF NOT EXISTS idx_places_search ON public.places USING GIN(search_vector);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  chosen_role TEXT;
BEGIN
  chosen_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  IF chosen_role NOT IN ('user', 'contributor', 'admin') THEN
    chosen_role := 'user';
  END IF;

  INSERT INTO public.profiles (id, role, full_name, approved)
  VALUES (
    NEW.id,
    chosen_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE WHEN chosen_role = 'contributor' THEN false ELSE true END
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    approved = EXCLUDED.approved;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Haversine distance function
CREATE OR REPLACE FUNCTION public.distance_km(lat1 DOUBLE PRECISION, lon1 DOUBLE PRECISION, lat2 DOUBLE PRECISION, lon2 DOUBLE PRECISION)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  R DOUBLE PRECISION := 6371;
  dlat DOUBLE PRECISION := RADIANS(lat2 - lat1);
  dlon DOUBLE PRECISION := RADIANS(lon2 - lon1);
  a DOUBLE PRECISION := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon/2) * SIN(dlon/2);
  c DOUBLE PRECISION := 2 * ATAN2(SQRT(a), SQRT(1-a));
BEGIN
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Nearby places function
CREATE OR REPLACE FUNCTION public.nearby_places(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  religion TEXT,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.address,
    p.city,
    p.state,
    p.latitude,
    p.longitude,
    p.religion,
    public.distance_km(p_lat, p_lng, p.latitude, p.longitude) AS distance
  FROM public.places p
  WHERE p.status = 'published'
    AND p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND public.distance_km(p_lat, p_lng, p.latitude, p.longitude) <= radius_km
  ORDER BY distance ASC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Places policies
CREATE POLICY "Published places are viewable by everyone" ON public.places
  FOR SELECT USING (status = 'published');

-- Place images policies
CREATE POLICY "Place images viewable by everyone" ON public.place_images
  FOR SELECT USING (true);

-- Events policies
CREATE POLICY "Approved events are viewable by everyone" ON public.events
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Contributors can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Contributors can view own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Contributors can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can manage own bookmarks" ON public.user_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Blog & pages public read
CREATE POLICY "Published blog posts are viewable" ON public.blog_posts
  FOR SELECT USING (status = 'published');
CREATE POLICY "Published pages are viewable" ON public.pages
  FOR SELECT USING (status = 'published');
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Storage bucket for place images
INSERT INTO storage.buckets (id, name, public) VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: allow public read
CREATE POLICY "Public can read place-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'place-images');
