CREATE TABLE public.part_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  part_id uuid NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  price numeric,
  asin text,
  image_url text,
  price_updated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, part_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.part_overrides TO authenticated;
GRANT ALL ON public.part_overrides TO service_role;

ALTER TABLE public.part_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own part overrides" ON public.part_overrides
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX part_overrides_user_idx ON public.part_overrides (user_id);

CREATE TRIGGER part_overrides_set_updated_at
  BEFORE UPDATE ON public.part_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();