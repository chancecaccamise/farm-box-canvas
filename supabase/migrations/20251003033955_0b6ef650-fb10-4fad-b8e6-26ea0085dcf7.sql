-- Create new table with method-specific day settings
CREATE TABLE public.delivery_method_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_method text NOT NULL,
  day_name text NOT NULL,
  display_name text NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  UNIQUE (delivery_method, day_name)
);

-- Insert initial data based on requirements
INSERT INTO public.delivery_method_settings (delivery_method, day_name, display_name, is_available)
VALUES 
  -- Home Delivery: Saturday only
  ('delivery', 'thursday', 'Thursday', false),
  ('delivery', 'saturday', 'Saturday', true),
  ('delivery', 'sunday', 'Sunday', false),
  
  -- Market Pickup: Saturday only
  ('market-pickup', 'thursday', 'Thursday', false),
  ('market-pickup', 'saturday', 'Saturday', true),
  ('market-pickup', 'sunday', 'Sunday', false),
  
  -- Farm Pickup: Saturday and Sunday
  ('farm-pickup', 'thursday', 'Thursday', false),
  ('farm-pickup', 'saturday', 'Saturday', true),
  ('farm-pickup', 'sunday', 'Sunday', true);

-- Enable RLS
ALTER TABLE public.delivery_method_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Delivery method settings are viewable by everyone"
  ON public.delivery_method_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update delivery method settings"
  ON public.delivery_method_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_delivery_method_settings_updated_at
  BEFORE UPDATE ON public.delivery_method_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();