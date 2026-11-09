CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- The studio owner (first account created) becomes the admin.
CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

CREATE TABLE public.tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'زفات',
  duration text NOT NULL DEFAULT '—',
  description text NOT NULL DEFAULT '',
  audio_path text,
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tracks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tracks TO authenticated;
GRANT ALL ON public.tracks TO service_role;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view works" ON public.tracks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert works" ON public.tracks FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update works" ON public.tracks FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete works" ON public.tracks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.tracks (title, category, duration, description, featured, sort_order) VALUES
('ليلة العمر','زفات','00:35','زفة دخول هادئة بطابع ملكي',true,1),
('فرحة أهل','زفات','00:28','إيقاع احتفالي دافئ',false,2),
('يا أجمل حكاية','شيلات','00:42','شيلة عاطفية بإحساس خليجي',false,3),
('ليلة مختلفة','مخصص','00:31','عمل قابل للتخصيص بالأسماء',false,4),
('فرحة سنين','شيلات','00:39','إهداء للأهل والأحباب',false,5),
('لحظة وصول','زفات','00:33','موسيقى دخول أنيقة',false,6);

CREATE POLICY "Admins upload audio" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'track-audio' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update audio" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'track-audio' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete audio" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'track-audio' AND public.has_role(auth.uid(), 'admin'));