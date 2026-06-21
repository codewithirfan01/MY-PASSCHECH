CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  useful_feedback TEXT NOT NULL,
  improvement_feedback TEXT,
  discovery_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can read all reviews — it's a public review wall
CREATE POLICY "select_all_reviews" ON public.reviews
  FOR SELECT TO anon, authenticated USING (true);

-- Only authenticated users can submit a review, and only as themselves
CREATE POLICY "insert_own_review" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users may update their own review (e.g. edit after submitting)
CREATE POLICY "update_own_review" ON public.reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users may delete their own review
CREATE POLICY "delete_own_review" ON public.reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX reviews_created_at_idx ON public.reviews(created_at DESC);
CREATE INDEX reviews_user_id_idx ON public.reviews(user_id);
