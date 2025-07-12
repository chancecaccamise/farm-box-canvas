-- Add missing fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS inventory_count INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for better performance on tags
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Create index for availability filtering
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(is_available);

-- Insert additional sample data to make the database more comprehensive
INSERT INTO public.products (name, category, price, description, image, is_available, inventory_count, tags) VALUES 
-- Vegetables
('Sweet Corn', 'Vegetables', 5.00, 'Fresh local sweet corn, perfect for grilling', null, true, 75, ARRAY['seasonal', 'grilling', 'summer']),
('Zucchini', 'Vegetables', 3.50, 'Tender green zucchini, great for bread and grilling', null, true, 90, ARRAY['summer', 'versatile', 'local']),
('Bell Peppers - Mixed', 'Vegetables', 6.00, 'Colorful mix of red, yellow, and orange bell peppers', null, true, 60, ARRAY['colorful', 'sweet', 'vitamin-c']),
('Brussels Sprouts', 'Vegetables', 4.50, 'Fresh Brussels sprouts on the stalk', null, true, 45, ARRAY['fall', 'cruciferous', 'roasting']),
('Kale', 'Vegetables', 3.00, 'Nutrient-rich curly kale leaves', null, true, 80, ARRAY['superfood', 'healthy', 'year-round']),
('Spinach', 'Vegetables', 3.50, 'Baby spinach leaves, perfect for salads', null, true, 85, ARRAY['baby', 'salad', 'iron']),

-- Herbs
('Oregano', 'Herbs', 2.50, 'Fresh oregano for Mediterranean cooking', null, true, 40, ARRAY['mediterranean', 'aromatic', 'pizza']),
('Thyme', 'Herbs', 2.50, 'Fresh thyme sprigs', null, true, 35, ARRAY['aromatic', 'french', 'roasting']),
('Rosemary', 'Herbs', 3.00, 'Fresh rosemary sprigs, perfect for roasting', null, true, 30, ARRAY['aromatic', 'roasting', 'hearty']),
('Sage', 'Herbs', 2.50, 'Fresh sage leaves', null, true, 25, ARRAY['aromatic', 'autumn', 'thanksgiving']),
('Parsley - Flat Leaf', 'Herbs', 2.00, 'Fresh Italian flat-leaf parsley', null, true, 55, ARRAY['italian', 'garnish', 'vitamin-k']),

-- Seafood
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
('Herb Salt Blend', 'Pantry', 6.00, 'House-made herb and sea salt blend', null, true, 40, ARRAY['house-made', 'seasoning', 'gourmet'])

ON CONFLICT (name) DO NOTHING;