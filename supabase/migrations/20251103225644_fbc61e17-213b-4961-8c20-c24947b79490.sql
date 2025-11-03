-- Add RLS policies for admin management of partners table

-- Allow admins to insert partners
CREATE POLICY "Admins can insert partners"
ON public.partners
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update partners
CREATE POLICY "Admins can update partners"
ON public.partners
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete partners
CREATE POLICY "Admins can delete partners"
ON public.partners
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));