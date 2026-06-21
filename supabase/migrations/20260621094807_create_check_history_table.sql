CREATE TABLE IF NOT EXISTS public.check_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL CHECK (check_type IN ('password', 'email')),
  result_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.check_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_history" ON public.check_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_history" ON public.check_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_history" ON public.check_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX check_history_user_id_idx ON public.check_history(user_id DESC);
CREATE INDEX check_history_created_at_idx ON public.check_history(created_at DESC);
