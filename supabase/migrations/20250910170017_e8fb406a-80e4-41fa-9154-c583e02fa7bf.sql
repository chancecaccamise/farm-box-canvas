-- Create gallery_images table for Ana's Arrangements
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('wedding', 'celebration', 'baby-shower', 'seasonal')),
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for admin-only access
CREATE POLICY "Only admins can manage gallery images" 
ON public.gallery_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can view active gallery images
CREATE POLICY "Gallery images are viewable by everyone" 
ON public.gallery_images 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON public.gallery_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial data based on current hardcoded images
INSERT INTO public.gallery_images (title, description, category, image_url, sort_order) VALUES
('Elegant Wedding Bouquet', 'Beautiful white and blush arrangement perfect for weddings', 'wedding', '/src/assets/weddingBouquet.png', 1),
('Birthday Celebration', 'Vibrant centerpiece arrangement for special celebrations', 'celebration', '/src/assets/Happy Birthday Centerpeice.jpeg', 2),
('Baby Shower Delight', 'Soft pastel arrangement perfect for baby showers', 'baby-shower', '/src/assets/baby-shower-flowers.jpg', 3),
('Seasonal Bouquet', 'Fresh seasonal flowers in natural arrangement', 'seasonal', '/src/assets/seasonal-bouquet.jpg', 4),
('Birthday Flowers', 'Cheerful birthday arrangement with mixed flowers', 'celebration', '/src/assets/birthday-flowers.jpg', 5),
('Large Table Centerpiece', 'Grand arrangement for special dining occasions', 'wedding', '/src/assets/Large on table.jpg', 6);