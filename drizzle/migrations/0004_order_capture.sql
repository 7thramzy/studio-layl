-- Capture orders in the database (previously they only went to WhatsApp) and let the admin track them.
ALTER TABLE public.orders
  ADD COLUMN version text NOT NULL DEFAULT '',
  ADD COLUMN addons text[] NOT NULL DEFAULT '{}',
  ADD COLUMN reference text NOT NULL DEFAULT '',
  ADD COLUMN status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','delivered','cancelled'));
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT UPDATE (status) ON public.orders TO authenticated;
CREATE POLICY "Anyone can submit orders" ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND char_length(name) BETWEEN 1 AND 80 AND char_length(details) <= 1500 AND char_length(reference) <= 200);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
