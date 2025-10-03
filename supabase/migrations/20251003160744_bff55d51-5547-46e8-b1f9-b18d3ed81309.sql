-- Update get_admin_user_list to return only one row per user with their latest subscription
CREATE OR REPLACE FUNCTION public.get_admin_user_list()
RETURNS TABLE (
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  phone text,
  sms_notifications boolean,
  email_newsletter boolean,
  created_at timestamptz,
  subscription_status text,
  subscription_type text,
  stripe_subscription_id text
)
SECURITY DEFINER
SET search_path TO 'public'
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Return combined user data with latest subscription per user
  RETURN QUERY
  SELECT DISTINCT ON (p.user_id)
    p.user_id,
    au.email::text,
    p.first_name,
    p.last_name,
    p.phone,
    p.sms_notifications,
    p.email_newsletter,
    p.created_at,
    us.status::text as subscription_status,
    us.subscription_type,
    us.stripe_subscription_id
  FROM public.profiles p
  LEFT JOIN auth.users au ON p.user_id = au.id
  LEFT JOIN public.user_subscriptions us ON p.user_id = us.user_id
  ORDER BY p.user_id, us.updated_at DESC NULLS LAST, p.created_at DESC;
END;
$$;