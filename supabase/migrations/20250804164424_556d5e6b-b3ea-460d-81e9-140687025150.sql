-- Create serviceable zip codes table
CREATE TABLE public.serviceable_zip_codes (
  zip_code TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.serviceable_zip_codes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read serviceable zip codes
CREATE POLICY "Serviceable zip codes are viewable by everyone" 
ON public.serviceable_zip_codes 
FOR SELECT 
USING (is_active = true);

-- Only admins can manage zip codes
CREATE POLICY "Only admins can manage serviceable zip codes" 
ON public.serviceable_zip_codes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_serviceable_zip_codes_updated_at
BEFORE UPDATE ON public.serviceable_zip_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial serviceable zip codes (example data)
INSERT INTO public.serviceable_zip_codes (zip_code, city, state) VALUES
('90210', 'Beverly Hills', 'CA'),
('90211', 'Beverly Hills', 'CA'),
('90024', 'Los Angeles', 'CA'),
('90025', 'Los Angeles', 'CA'),
('90026', 'Los Angeles', 'CA'),
('90027', 'Los Angeles', 'CA'),
('90028', 'Hollywood', 'CA'),
('90029', 'Los Angeles', 'CA'),
('90036', 'Los Angeles', 'CA'),
('90046', 'West Hollywood', 'CA'),
('90048', 'West Hollywood', 'CA'),
('90069', 'West Hollywood', 'CA'),
('90210', 'Beverly Hills', 'CA'),
('91403', 'Sherman Oaks', 'CA'),
('91423', 'Sherman Oaks', 'CA'),
('91436', 'Encino', 'CA'),
('90403', 'Santa Monica', 'CA'),
('90404', 'Santa Monica', 'CA'),
('90405', 'Santa Monica', 'CA'),
('92651', 'Laguna Beach', 'CA'),
('92660', 'Newport Beach', 'CA'),
('92661', 'Newport Beach', 'CA'),
('92662', 'Newport Beach', 'CA'),
('92663', 'Newport Beach', 'CA');