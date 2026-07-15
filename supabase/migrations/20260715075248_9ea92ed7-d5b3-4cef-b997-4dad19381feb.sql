CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(lower(auth.jwt() ->> 'email') = 'landonjamesmckale@gmail.com', false);
$function$;