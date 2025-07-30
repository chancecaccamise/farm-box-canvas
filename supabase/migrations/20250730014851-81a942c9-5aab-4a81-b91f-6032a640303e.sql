-- Insert 9 test products for development and testing

INSERT INTO public.products (name, category, description, price, image, is_available, inventory_count, tags) VALUES
('Organic Heirloom Tomatoes', 'vegetables', 'Beautiful, flavorful heirloom tomatoes grown using organic farming methods. Perfect for salads, sandwiches, or cooking.', 6.50, '/api/placeholder/300/200', true, 50, ARRAY['organic', 'local', 'heirloom', 'fresh']),

('Fresh Rainbow Carrots', 'vegetables', 'Colorful rainbow carrots including purple, orange, and yellow varieties. Sweet and crunchy, perfect for snacking or roasting.', 4.25, '/api/placeholder/300/200', true, 75, ARRAY['fresh', 'colorful', 'sweet', 'local']),

('Local Honey', 'other', 'Pure, raw honey from local beekeepers. Rich flavor and natural sweetness perfect for tea, toast, or cooking.', 12.00, '/api/placeholder/300/200', true, 30, ARRAY['local', 'raw', 'natural', 'artisan']),

('Farm Fresh Eggs', 'dairy', 'Free-range eggs from happy chickens. Rich, orange yolks and superior flavor from pasture-raised hens.', 5.50, '/api/placeholder/300/200', true, 60, ARRAY['free-range', 'fresh', 'pasture-raised', 'local']),

('Atlantic Salmon Fillet', 'fish', 'Fresh Atlantic salmon fillet, sustainably caught. Rich in omega-3s and perfect for grilling or baking.', 18.00, '/api/placeholder/300/200', true, 25, ARRAY['fresh', 'sustainable', 'omega-3', 'premium']),

('Mixed Salad Greens', 'vegetables', 'Fresh mix of lettuce, spinach, arugula, and other seasonal greens. Perfect for salads and sandwiches.', 3.75, '/api/placeholder/300/200', true, 80, ARRAY['fresh', 'mixed', 'organic', 'salad']),

('Seasonal Apple Variety', 'fruits', 'Fresh seasonal apples, variety depends on harvest time. Crisp, sweet, and perfect for snacking or baking.', 4.00, '/api/placeholder/300/200', true, 100, ARRAY['seasonal', 'fresh', 'crisp', 'local']),

('Fresh Basil Bunch', 'herbs', 'Fragrant fresh basil bunch, perfect for cooking, making pesto, or garnishing dishes.', 2.50, '/api/placeholder/300/200', true, 40, ARRAY['fresh', 'aromatic', 'herbs', 'cooking']),

('Grass-Fed Ground Beef', 'meat', 'Premium grass-fed ground beef from local farms. Lean, flavorful, and sustainably raised.', 15.00, '/api/placeholder/300/200', true, 35, ARRAY['grass-fed', 'local', 'premium', 'sustainable']);