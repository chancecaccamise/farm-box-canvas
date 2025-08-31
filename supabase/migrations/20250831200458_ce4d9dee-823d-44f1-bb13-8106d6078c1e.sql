-- Fix security issue: Restrict partner_applications table access and add proper RLS policies

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can insert partner applications" ON public.partner_applications;

-- Add proper RLS policies for partner applications
-- Allow anyone to insert applications (needed for public partner application form)
-- but add basic validation to prevent empty/invalid submissions
CREATE POLICY "Anyone can submit partner applications" 
ON public.partner_applications 
FOR INSERT 
WITH CHECK (
  length(trim(full_name)) > 0 AND
  length(trim(business_name)) > 0 AND
  length(trim(email)) > 0 AND
  length(trim(phone_number)) > 0 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Allow admins to view all partner applications
CREATE POLICY "Admins can view partner applications" 
ON public.partner_applications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update partner applications (status, admin notes)
CREATE POLICY "Admins can update partner applications" 
ON public.partner_applications 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete spam or invalid applications
CREATE POLICY "Admins can delete partner applications" 
ON public.partner_applications 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));