-- Create site_settings table for global settings like checkout pause
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_paused boolean NOT NULL DEFAULT false,
  checkout_paused_message text DEFAULT 'We''re taking a short break! Check back soon.',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default row
INSERT INTO public.site_settings (id, checkout_paused) 
VALUES (gen_random_uuid(), false);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read site settings
CREATE POLICY "Site settings are viewable by everyone"
  ON public.site_settings FOR SELECT USING (true);

-- Only admins can update site settings
CREATE POLICY "Only admins can update site settings"
  ON public.site_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();