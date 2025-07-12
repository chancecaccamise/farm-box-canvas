-- Create partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('restaurants', 'bakery', 'fisherman')),
  description TEXT,
  bio TEXT,
  image_url TEXT,
  header_image_url TEXT,
  location TEXT,
  rating DECIMAL(2,1) DEFAULT 5.0,
  partnership_duration TEXT,
  specialties TEXT[],
  story TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create partner_products table
CREATE TABLE public.partner_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner_id, product_id)
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_products ENABLE ROW LEVEL SECURITY;

-- Create policies for partners (public readable)
CREATE POLICY "Partners are viewable by everyone" 
ON public.partners 
FOR SELECT 
USING (true);

-- Create policies for partner_products (public readable)
CREATE POLICY "Partner products are viewable by everyone" 
ON public.partner_products 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample partners
INSERT INTO public.partners (name, slug, category, description, bio, image_url, location, rating, partnership_duration, specialties, story) VALUES
-- Restaurants
('Farm Table Bistro', 'farm-table-bistro', 'restaurants', 'Farm-to-table dining with seasonal menus', 'A cozy restaurant focusing on locally sourced ingredients and seasonal cooking. Chef Maria has been creating memorable dining experiences for over 8 years.', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400', 'Downtown Savannah', 4.8, '3 years', ARRAY['Seasonal Menus', 'Local Sourcing', 'Wine Pairing'], 'Farm Table Bistro opened its doors in 2019 with a simple mission: to showcase the incredible flavors of locally grown produce. Chef Maria partners directly with local farms to create seasonal menus that change with the harvest.'),
('Coastal Kitchen', 'coastal-kitchen', 'restaurants', 'Seafood restaurant specializing in fresh coastal cuisine', 'A waterfront restaurant known for its fresh seafood and stunning marsh views. The team has been serving the community for over a decade.', 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400', 'Tybee Island', 4.9, '5 years', ARRAY['Fresh Seafood', 'Waterfront Dining', 'Local Fish'], 'Located on the beautiful Tybee Island, Coastal Kitchen has been a beloved destination for both locals and visitors. Their commitment to serving only the freshest, locally caught seafood has made them a cornerstone of the community.'),

-- Bakery
('Sunrise Artisan Bakery', 'sunrise-artisan-bakery', 'bakery', 'Handcrafted breads and pastries using organic ingredients', 'A family-owned bakery dedicated to traditional baking methods and organic ingredients. Every loaf is made with care and attention to detail.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 'Historic District', 4.7, '4 years', ARRAY['Organic Ingredients', 'Sourdough', 'Artisan Breads'], 'Started by baker Emma Thompson in 2020, Sunrise Artisan Bakery brings old-world baking techniques to modern kitchens. Using only organic flours and natural fermentation, every product tells a story of craftsmanship.'),
('Sweet Magnolia', 'sweet-magnolia', 'bakery', 'Southern-inspired desserts and wedding cakes', 'Specializing in traditional Southern desserts with a modern twist. Known for their famous pecan pie and custom wedding cakes.', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400', 'Midtown Savannah', 4.6, '2 years', ARRAY['Wedding Cakes', 'Pecan Pie', 'Southern Desserts'], 'Sweet Magnolia was born from a love of Southern hospitality and sweet traditions. Owner Sarah Mae combines family recipes passed down through generations with innovative techniques to create unforgettable desserts.'),

-- Fisherman
('Captain Joe''s Catch', 'captain-joes-catch', 'fisherman', 'Sustainable fishing operation providing fresh daily catch', 'A third-generation fishing family committed to sustainable practices. Captain Joe brings in the freshest catch from the pristine waters off the Georgia coast.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 'Savannah Harbor', 5.0, '6 years', ARRAY['Sustainable Fishing', 'Daily Fresh Catch', 'Local Waters'], 'Captain Joe learned to fish from his grandfather and has been working these waters for over 30 years. His commitment to sustainable fishing practices ensures that future generations will continue to enjoy the bounty of our coastal waters.'),
('Tidewater Seafood', 'tidewater-seafood', 'fisherman', 'Family-run seafood operation focusing on quality and freshness', 'A family business that has been providing fresh seafood to the Savannah area for over 20 years. Known for their premium shrimp and fish.', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', 'Isle of Hope', 4.8, '7 years', ARRAY['Premium Shrimp', 'Fresh Fish', 'Family Business'], 'The Morrison family has been in the seafood business for three generations. Tidewater Seafood represents their commitment to quality, freshness, and sustainable practices that respect our coastal ecosystem.');