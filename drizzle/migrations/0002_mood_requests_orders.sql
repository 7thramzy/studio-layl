CREATE TABLE public.mood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mood text NOT NULL,
  picks jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.mood_requests TO authenticated;
GRANT ALL ON public.mood_requests TO service_role;
ALTER TABLE public.mood_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view mood requests" ON public.mood_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete mood requests" ON public.mood_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  work_type text NOT NULL,
  occasion text NOT NULL DEFAULT '',
  event_date date,
  details text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));