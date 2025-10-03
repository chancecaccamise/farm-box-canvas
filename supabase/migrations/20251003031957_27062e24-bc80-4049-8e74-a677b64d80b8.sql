-- Create delivery day settings table
CREATE TABLE public.delivery_day_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_name text NOT NULL UNIQUE,
  is_available boolean NOT NULL DEFAULT true,
  display_name text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default delivery days (all available by default)
INSERT INTO public.delivery_day_settings (day_name, display_name, is_available)
VALUES 
  ('thursday', 'Thursday', true),
  ('saturday', 'Saturday', true),
  ('sunday', 'Sunday', true);

-- Enable RLS
ALTER TABLE public.delivery_day_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read delivery day settings
CREATE POLICY "Delivery day settings are viewable by everyone"
  ON public.delivery_day_settings
  FOR SELECT
  USING (true);

-- Policy: Only admins can update delivery day settings
CREATE POLICY "Only admins can update delivery day settings"
  ON public.delivery_day_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_delivery_day_settings_updated_at
  BEFORE UPDATE ON public.delivery_day_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();