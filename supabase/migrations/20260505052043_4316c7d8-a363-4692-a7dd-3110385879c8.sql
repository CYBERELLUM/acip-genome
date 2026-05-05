-- Add developer role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer';

-- Role requests queue
CREATE TABLE IF NOT EXISTS public.role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  requested_role public.app_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own role requests"
  ON public.role_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage role requests"
  ON public.role_requests FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Updated new-user handler: profile + base 'user' role + queue elevated requests
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_requested TEXT;
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'display_name')
  ON CONFLICT (id) DO NOTHING;

  -- Always grant base user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  v_requested := NEW.raw_user_meta_data ->> 'requested_role';

  IF v_requested IN ('admin', 'developer') THEN
    INSERT INTO public.role_requests (user_id, email, requested_role, status)
    VALUES (NEW.id, NEW.email, v_requested::public.app_role, 'pending');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();