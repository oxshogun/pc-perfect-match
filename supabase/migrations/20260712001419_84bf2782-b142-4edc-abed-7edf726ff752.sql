-- 1. Extend parts with visibility + allow null owner for catalog rows
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private';
ALTER TABLE public.parts DROP CONSTRAINT IF EXISTS parts_visibility_check;
ALTER TABLE public.parts ADD CONSTRAINT parts_visibility_check CHECK (visibility IN ('catalog', 'private'));
ALTER TABLE public.parts ALTER COLUMN owner_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS parts_visibility_idx ON public.parts(visibility);
CREATE INDEX IF NOT EXISTS parts_owner_idx ON public.parts(owner_id);

-- 2. Admin identification (by email). Security definer so RLS can call it.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(lower(auth.jwt() ->> 'email') = 'landonjamesmckale@gmail.com', false);
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Replace the blanket parts policy with granular ones
DROP POLICY IF EXISTS "own parts" ON public.parts;

CREATE POLICY "parts read catalog or own"
  ON public.parts FOR SELECT TO authenticated
  USING (visibility = 'catalog' OR auth.uid() = owner_id);

CREATE POLICY "parts insert own private or admin catalog"
  ON public.parts FOR INSERT TO authenticated
  WITH CHECK (
    (visibility = 'private' AND auth.uid() = owner_id)
    OR (visibility = 'catalog' AND public.is_admin())
  );

CREATE POLICY "parts update own private or admin catalog"
  ON public.parts FOR UPDATE TO authenticated
  USING (
    (visibility = 'private' AND auth.uid() = owner_id)
    OR (visibility = 'catalog' AND public.is_admin())
  )
  WITH CHECK (
    (visibility = 'private' AND auth.uid() = owner_id)
    OR (visibility = 'catalog' AND public.is_admin())
  );

CREATE POLICY "parts delete own private or admin catalog"
  ON public.parts FOR DELETE TO authenticated
  USING (
    (visibility = 'private' AND auth.uid() = owner_id)
    OR (visibility = 'catalog' AND public.is_admin())
  );

-- 4. Auto-update updated_at on both tables (function already exists)
DROP TRIGGER IF EXISTS parts_set_updated_at ON public.parts;
CREATE TRIGGER parts_set_updated_at
  BEFORE UPDATE ON public.parts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS builds_set_updated_at ON public.builds;
CREATE TRIGGER builds_set_updated_at
  BEFORE UPDATE ON public.builds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();