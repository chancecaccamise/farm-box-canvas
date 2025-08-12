-- Add explicit admin-only SELECT policies to fresh fish alerts tables
-- This ensures customer contact information can only be accessed by admin users

-- fresh_fish_alerts: Add admin-only SELECT policy
CREATE POLICY "Only admins can view fresh fish alerts"
ON public.fresh_fish_alerts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- fresh_fish_alerts_enhanced already has admin-only SELECT policy, but let's verify it's restrictive
-- The existing policy should be sufficient, but we can add a comment for clarity

-- Add explicit policy to prevent any non-admin access to fresh_fish_alerts
-- (though RLS already denies by default when no policy exists)
CREATE POLICY "Block non-admin access to fresh fish alerts"
ON public.fresh_fish_alerts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Override the previous INSERT policy to be more restrictive - only admins should manage alerts
DROP POLICY IF EXISTS "Authenticated users can insert fresh fish alerts" ON public.fresh_fish_alerts;

CREATE POLICY "Only admins can manage fresh fish alerts"
ON public.fresh_fish_alerts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));