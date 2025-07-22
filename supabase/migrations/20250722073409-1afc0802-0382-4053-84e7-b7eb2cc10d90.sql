
-- Add confirmation fields to box_templates table
ALTER TABLE public.box_templates 
ADD COLUMN is_confirmed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN confirmed_by UUID REFERENCES auth.users(id);

-- Create enhanced fresh fish alerts table
CREATE TABLE public.fresh_fish_alerts_enhanced (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  preferred_fish_types TEXT[],
  delivery_preferences TEXT,
  communication_preferences TEXT[],
  zip_code TEXT,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bouquet requests table for Ana's Flowers
CREATE TABLE public.bouquet_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE,
  color_palette TEXT,
  preferences TEXT,
  reference_photos TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  estimated_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.fresh_fish_alerts_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bouquet_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for fresh_fish_alerts_enhanced
CREATE POLICY "Users can insert enhanced fish alerts" 
ON public.fresh_fish_alerts_enhanced 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all enhanced fish alerts" 
ON public.fresh_fish_alerts_enhanced 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update enhanced fish alerts" 
ON public.fresh_fish_alerts_enhanced 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for bouquet_requests
CREATE POLICY "Users can insert bouquet requests" 
ON public.bouquet_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all bouquet requests" 
ON public.bouquet_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bouquet requests" 
ON public.bouquet_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for box_templates confirmation
CREATE POLICY "Admins can confirm box templates" 
ON public.box_templates 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update existing box templates policy to include confirmation fields
DROP POLICY "Only admins can manage box templates" ON public.box_templates;
CREATE POLICY "Only admins can manage box templates" 
ON public.box_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update MyBag to only show confirmed templates
CREATE POLICY "Users can view confirmed box templates" 
ON public.box_templates 
FOR SELECT 
USING (is_confirmed = true OR has_role(auth.uid(), 'admin'::app_role));
