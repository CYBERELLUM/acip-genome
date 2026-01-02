-- Enable RLS on vip_emails (admin-only table)
ALTER TABLE public.vip_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage VIP emails
CREATE POLICY "Admins can view VIP emails"
ON public.vip_emails
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage VIP emails"
ON public.vip_emails
FOR ALL
USING (public.is_admin(auth.uid()));