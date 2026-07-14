export type ProfileRole = 'user' | 'contributor' | 'admin';

export interface Profile {
  id: string;
  role: ProfileRole;
  full_name: string | null;
  organization: string | null;
  position: string | null;
  bio: string | null;
  approved: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type PlaceStatus = 'draft' | 'ai_generated' | 'published';

export interface Place {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string;
  state: string;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  religion: string;
  denomination: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  language: string[];
  facilities: string[];
  schedule_notes: Record<string, unknown>;
  transport_info: Record<string, unknown>;
  content_long: string | null;
  status: PlaceStatus;
  featured_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaceWithImages extends Place {
  images: PlaceImage[];
}

export interface PlaceImage {
  id: string;
  place_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  created_at: string;
}

export type EventStatus = 'pending' | 'approved' | 'rejected';

export interface EventItem {
  id: string;
  place_id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  category: string | null;
  status: EventStatus;
  ai_reason: string | null;
  created_at: string;
  updated_at: string;
  place?: Place;
}

export interface UserBookmark {
  user_id: string;
  place_id: string;
  created_at: string;
  place?: Place;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image: string | null;
  category_id: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  status: 'draft' | 'published';
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  updated_at: string;
}

export interface CsvPlaceRow {
  name: string;
  address?: string;
  city: string;
  state: string;
  zip?: string;
  latitude?: string;
  longitude?: string;
  religion: string;
  denomination?: string;
  phone?: string;
  website?: string;
  email?: string;
  language?: string;
  facilities?: string;
  image_url1?: string;
  image_url2?: string;
  image_url3?: string;
  schedule_notes?: string;
  description?: string;
}
