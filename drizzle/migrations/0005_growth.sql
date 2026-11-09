ALTER TABLE public.orders ADD COLUMN phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 30);
ALTER TABLE public.tracks ADD COLUMN lyrics text NOT NULL DEFAULT '', ADD COLUMN plays int NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_plays(track_id uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$ UPDATE public.tracks SET plays = plays + 1 WHERE id = track_id $$;
GRANT EXECUTE ON FUNCTION public.increment_plays(uuid) TO anon, authenticated;

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) <= 80),
  city text NOT NULL DEFAULT '' CHECK (char_length(city) <= 80),
  body text NOT NULL CHECK (char_length(body) <= 600),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins add reviews" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete reviews" ON public.testimonials FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
