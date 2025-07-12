-- Create table for fresh catch announcements
CREATE TABLE public.fresh_catch_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fish_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for SMS alerts signup
CREATE TABLE public.fresh_fish_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for partner applications
CREATE TABLE public.partner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fresh_catch_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fresh_fish_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for fresh catch announcements (public read)
CREATE POLICY "Fresh catch announcements are viewable by everyone" 
ON public.fresh_catch_announcements 
FOR SELECT 
USING (true);

-- Create policies for fresh fish alerts (users can insert their own)
CREATE POLICY "Users can insert fresh fish alerts" 
ON public.fresh_fish_alerts 
FOR INSERT 
WITH CHECK (true);

-- Create policies for partner applications (users can insert their own)
CREATE POLICY "Users can insert partner applications" 
ON public.partner_applications 
FOR INSERT 
WITH CHECK (true);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_fresh_catch_announcements_updated_at
BEFORE UPDATE ON public.fresh_catch_announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fresh_fish_alerts_updated_at
BEFORE UPDATE ON public.fresh_fish_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_applications_updated_at
BEFORE UPDATE ON public.partner_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();