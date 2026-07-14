-- Job queue for background processing (import AI content, images, etc.)
CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_queue_status ON public.job_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_job_queue_type ON public.job_queue(type);

-- Job queue is managed only server-side; no public policies needed.
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;

-- Helper function to count published posts per category (useful for CMS)
CREATE OR REPLACE FUNCTION public.count_posts_per_category()
RETURNS TABLE (category_id UUID, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT bp.category_id, COUNT(*)::BIGINT
  FROM public.blog_posts bp
  WHERE bp.status = 'published'
  GROUP BY bp.category_id;
END;
$$ LANGUAGE plpgsql STABLE;
