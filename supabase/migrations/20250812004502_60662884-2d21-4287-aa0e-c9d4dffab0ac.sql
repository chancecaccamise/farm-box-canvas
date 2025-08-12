-- Restrict inserts on public.fresh_fish_alerts and public.fresh_fish_alerts_enhanced to authenticated users only

-- fresh_fish_alerts
ALTER TABLE public.fresh_fish_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert fresh fish alerts" ON public.fresh_fish_alerts;

CREATE POLICY "Authenticated users can insert fresh fish alerts"
ON public.fresh_fish_alerts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure there are no overly permissive SELECT/UPDATE/DELETE policies (none exist in current schema)

-- fresh_fish_alerts_enhanced
ALTER TABLE public.fresh_fish_alerts_enhanced ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert enhanced fish alerts" ON public.fresh_fish_alerts_enhanced;

CREATE POLICY "Authenticated users can insert enhanced fish alerts"
ON public.fresh_fish_alerts_enhanced
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Keep existing admin-only SELECT/UPDATE policies on enhanced table intact