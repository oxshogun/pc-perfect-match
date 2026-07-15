GRANT SELECT ON public.parts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parts TO authenticated;
GRANT ALL ON public.parts TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.builds TO authenticated;
GRANT ALL ON public.builds TO service_role;

GRANT SELECT, INSERT ON public.price_history TO authenticated;
GRANT ALL ON public.price_history TO service_role;

DROP POLICY IF EXISTS "parts read catalog or own" ON public.parts;
DROP POLICY IF EXISTS "parts read catalog publicly or own private" ON public.parts;
CREATE POLICY "parts read catalog publicly or own private"
ON public.parts
FOR SELECT
USING (
  visibility = 'catalog'::text
  OR auth.uid() = owner_id
);

DROP POLICY IF EXISTS "read own history" ON public.price_history;
CREATE POLICY "read own history"
ON public.price_history
FOR SELECT
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert own history" ON public.price_history;
CREATE POLICY "insert own history"
ON public.price_history
FOR INSERT
WITH CHECK (auth.uid() = owner_id);