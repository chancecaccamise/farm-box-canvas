
-- First, let's make sure we have an admin role in the user_roles table
-- Insert an admin role for the current authenticated user (you'll need to run this after logging in)
-- Replace 'your-email@example.com' with your actual email address

-- Function to assign admin role to a user by email
CREATE OR REPLACE FUNCTION public.assign_admin_role(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role if it doesn't exist
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create a function to check if current user is admin (for easier use in components)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;
