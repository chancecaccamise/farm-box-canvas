-- Update handle_new_user function to store phone number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, phone, sms_notifications, email_newsletter)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone',
    COALESCE((new.raw_user_meta_data ->> 'sms_notifications')::boolean, false),
    COALESCE((new.raw_user_meta_data ->> 'email_newsletter')::boolean, false)
  );
  RETURN new;
END;
$$;