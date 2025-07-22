
-- Update products with proper image references
-- Vegetables/Produce
UPDATE products SET image = 'leafy-greens.jpg' WHERE name ILIKE '%greens%' OR name ILIKE '%lettuce%' OR name ILIKE '%spinach%';
UPDATE products SET image = 'tomatoes.jpg' WHERE name ILIKE '%tomato%';
UPDATE products SET image = 'rainbow-carrots.jpg' WHERE name ILIKE '%carrot%';
UPDATE products SET image = 'bell-peppers.jpg' WHERE name ILIKE '%pepper%';

-- Add more specific product images for common farm box items
UPDATE products SET image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop' WHERE name ILIKE '%cucumber%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1553978297-833d09932d31?w=400&h=400&fit=crop' WHERE name ILIKE '%onion%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1566558017408-32d2b4b4f2b6?w=400&h=400&fit=crop' WHERE name ILIKE '%potato%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1619362280286-ee2a49806ccc?w=400&h=400&fit=crop' WHERE name ILIKE '%broccoli%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop' WHERE name ILIKE '%zucchini%';

-- Herbs
UPDATE products SET image = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop' WHERE category = 'herbs' AND name ILIKE '%basil%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1628556276832-e0631b1c3d26?w=400&h=400&fit=crop' WHERE category = 'herbs' AND name ILIKE '%cilantro%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1607874465412-4d8e0b9b7a9b?w=400&h=400&fit=crop' WHERE category = 'herbs' AND name ILIKE '%parsley%';

-- Seafood
UPDATE products SET image = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=400&fit=crop' WHERE category = 'seafood' AND name ILIKE '%salmon%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop' WHERE category = 'seafood' AND name ILIKE '%bass%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop' WHERE category = 'seafood' AND name ILIKE '%shrimp%';

-- Pantry items
UPDATE products SET image = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop' WHERE category = 'pantry' AND name ILIKE '%honey%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1566336810609-097ea2ee2604?w=400&h=400&fit=crop' WHERE category = 'pantry' AND name ILIKE '%olive%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop' WHERE category = 'pantry' AND (name ILIKE '%bread%' OR name ILIKE '%sourdough%');

-- Protein
UPDATE products SET image = 'https://images.unsplash.com/photo-1606756790138-261d2b21cd02?w=400&h=400&fit=crop' WHERE category = 'protein' AND name ILIKE '%chicken%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop' WHERE category = 'protein' AND name ILIKE '%beef%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop' WHERE category = 'protein' AND name ILIKE '%pork%';

-- Update any remaining null images with category defaults
UPDATE products SET image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop' WHERE image IS NULL AND category = 'produce';
UPDATE products SET image = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=400&fit=crop' WHERE image IS NULL AND category = 'seafood';
UPDATE products SET image = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop' WHERE image IS NULL AND category = 'herbs';
UPDATE products SET image = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop' WHERE image IS NULL AND category = 'pantry';
UPDATE products SET image = 'https://images.unsplash.com/photo-1606756790138-261d2b21cd02?w=400&h=400&fit=crop' WHERE image IS NULL AND category = 'protein';
