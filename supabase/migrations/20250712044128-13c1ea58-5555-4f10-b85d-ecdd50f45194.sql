-- Create products table with all required fields
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image TEXT,
  is_available BOOLEAN DEFAULT true,
  inventory_count INTEGER DEFAULT 100,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (products are public)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_available ON public.products(is_available);
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.products (name, category, price, description, image, is_available, inventory_count, tags) VALUES 
-- Original sample data
('AmberJack Fillet - Boneless/Skinless', 'Seafood', 16.00, 'Fresh amberjack fillet, boneless and skinless', null, true, 30, ARRAY['seafood', 'premium', 'boneless']),
('Basil', 'Herbs', 2.00, 'Fresh basil leaves, perfect for Italian dishes', null, true, 100, ARRAY['italian', 'aromatic', 'fresh']),
('Black Sea Bass Fillet - Boneless/Skinless', 'Seafood', 24.00, 'Premium black sea bass fillet', null, true, 25, ARRAY['seafood', 'premium', 'white-fish']),
('Bronze Fennel', 'Herbs', 3.00, 'Fresh bronze fennel with anise flavor', null, true, 45, ARRAY['aromatic', 'mediterranean', 'specialty']),
('Carrots', 'Vegetables', 4.00, 'Fresh organic carrots', null, true, 120, ARRAY['root-vegetable', 'organic', 'versatile']),
('Chervil', 'Herbs', 3.00, 'Delicate chervil with mild parsley flavor', null, true, 35, ARRAY['delicate', 'french', 'garnish']),
('Chives', 'Herbs', 2.00, 'Fresh chives for garnishing', null, true, 60, ARRAY['garnish', 'mild', 'versatile']),
('Chocolate Mint', 'Herbs', 2.00, 'Unique chocolate-scented mint variety', null, true, 40, ARRAY['mint', 'specialty', 'dessert']),
('Cilantro', 'Herbs', 2.00, 'Fresh cilantro leaves', null, true, 80, ARRAY['mexican', 'fresh', 'bright']),
('Clams (Small)', 'Seafood', 10.00, 'Fresh small clams', null, true, 50, ARRAY['shellfish', 'small', 'steaming']),
('Clams (Medium)', 'Seafood', 20.00, 'Fresh medium clams', null, true, 30, ARRAY['shellfish', 'medium', 'chowder']),
('Clams (Large)', 'Seafood', 35.00, 'Fresh large clams', null, true, 15, ARRAY['shellfish', 'large', 'stuffing']),

-- Additional vegetables
('Sweet Corn', 'Vegetables', 5.00, 'Fresh local sweet corn, perfect for grilling', null, true, 75, ARRAY['seasonal', 'grilling', 'summer']),
('Zucchini', 'Vegetables', 3.50, 'Tender green zucchini, great for bread and grilling', null, true, 90, ARRAY['summer', 'versatile', 'local']),
('Bell Peppers - Mixed', 'Vegetables', 6.00, 'Colorful mix of red, yellow, and orange bell peppers', null, true, 60, ARRAY['colorful', 'sweet', 'vitamin-c']),
('Brussels Sprouts', 'Vegetables', 4.50, 'Fresh Brussels sprouts on the stalk', null, true, 45, ARRAY['fall', 'cruciferous', 'roasting']),
('Kale', 'Vegetables', 3.00, 'Nutrient-rich curly kale leaves', null, true, 80, ARRAY['superfood', 'healthy', 'year-round']),
('Spinach', 'Vegetables', 3.50, 'Baby spinach leaves, perfect for salads', null, true, 85, ARRAY['baby', 'salad', 'iron']),

-- Additional herbs
('Oregano', 'Herbs', 2.50, 'Fresh oregano for Mediterranean cooking', null, true, 40, ARRAY['mediterranean', 'aromatic', 'pizza']),
('Thyme', 'Herbs', 2.50, 'Fresh thyme sprigs', null, true, 35, ARRAY['aromatic', 'french', 'roasting']),
('Rosemary', 'Herbs', 3.00, 'Fresh rosemary sprigs, perfect for roasting', null, true, 30, ARRAY['aromatic', 'roasting', 'hearty']),
('Sage', 'Herbs', 2.50, 'Fresh sage leaves', null, true, 25, ARRAY['aromatic', 'autumn', 'thanksgiving']),
('Parsley - Flat Leaf', 'Herbs', 2.00, 'Fresh Italian flat-leaf parsley', null, true, 55, ARRAY['italian', 'garnish', 'vitamin-k']),

-- Additional seafood
('Salmon Fillet - Atlantic', 'Seafood', 28.00, 'Fresh Atlantic salmon fillet, skin-on', null, true, 20, ARRAY['omega-3', 'premium', 'grilling']),
('Shrimp - Large', 'Seafood', 22.00, 'Fresh large shrimp, peeled and deveined', null, true, 35, ARRAY['quick-cooking', 'protein', 'versatile']),
('Cod Fillet', 'Seafood', 18.00, 'Fresh cod fillet, mild and flaky', null, true, 25, ARRAY['mild', 'white-fish', 'family-friendly']),
('Mussels', 'Seafood', 12.00, 'Fresh mussels in shell', null, true, 40, ARRAY['shellfish', 'steaming', 'wine-pairing']),

-- Fruits
('Strawberries', 'Fruits', 6.00, 'Sweet local strawberries', null, true, 50, ARRAY['sweet', 'spring', 'local', 'dessert']),
('Blueberries', 'Fruits', 8.00, 'Fresh blueberries, antioxidant-rich', null, true, 45, ARRAY['antioxidants', 'sweet', 'summer', 'healthy']),
('Apples - Honeycrisp', 'Fruits', 5.50, 'Crisp and sweet Honeycrisp apples', null, true, 70, ARRAY['crisp', 'sweet', 'fall', 'snacking']),
('Pears - Bartlett', 'Fruits', 5.00, 'Juicy Bartlett pears', null, true, 55, ARRAY['juicy', 'fall', 'baking']),

-- Specialty/Value-Added
('Farm Fresh Eggs', 'Dairy & Eggs', 7.00, 'Pasture-raised eggs from local farm', null, true, 60, ARRAY['pasture-raised', 'local', 'protein', 'breakfast']),
('Artisan Sourdough Bread', 'Bakery', 8.00, 'Handcrafted sourdough bread', null, true, 25, ARRAY['artisan', 'handmade', 'sourdough']),
('Local Honey', 'Pantry', 12.00, 'Raw local wildflower honey', null, true, 30, ARRAY['raw', 'local', 'wildflower', 'natural']),
('Herb Salt Blend', 'Pantry', 6.00, 'House-made herb and sea salt blend', null, true, 40, ARRAY['house-made', 'seasoning', 'gourmet']);