CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE lower(email) = 'ednercioazariasbonhane2@gmail.com' AND email_confirmed_at IS NOT NULL;
CREATE OR REPLACE FUNCTION public.has_valid_access(check_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT (check_user_id = auth.uid() OR auth.role() = 'service_role') AND EXISTS (
    SELECT 1 FROM public.user_access ua WHERE ua.user_id = check_user_id
    AND ua.revoked_at IS NULL AND (ua.valid_until IS NULL OR ua.valid_until > now())
  );
$$;
REVOKE ALL ON FUNCTION public.has_valid_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_valid_access(uuid) TO authenticated, service_role;