
-- First, let's update all products with proper images based on their categories and names
-- This will be a comprehensive update to ensure no product is left without an image

-- Produce category updates
UPDATE products SET image = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop' WHERE category = 'produce' AND (name ILIKE '%lettuce%' OR name ILIKE '%salad%' OR name ILIKE '%greens%');
UPDATE products SET image = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop' WHERE category = 'produce' AND name ILIKE '%tomato%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop' WHERE category = 'produce' AND name ILIKE '%carrot%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop' WHERE category = 'produce' AND name ILIKE '%pepper%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop' WHERE category = 'produce' AND name ILIKE '%cucumber%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=400&fit=crop' WHERE category = 'produce' AND name ILIKE '%onion%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1566558017408-32d2b4b4f2b6?w=400&h=400&fit=crop' WHERE category = 'produce' AND name ILIKE '%potato%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop' WHERE category = 'produce' AND name ILIKE '%broccoli%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop' WHERE category = 'produce' AND name ILIKE '%zucchini%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&h=400&fit=crop' WHERE category = 'produce' AND (name ILIKE '%apple%' OR name ILIKE '%fruit%');
UPDATE products SET image = 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop' WHERE category = 'produce' AND name ILIKE '%mushroom%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1606588245640-e26d9d159fb7?w=400&h=400&fit=crop' WHERE category = 'produce' AND name ILIKE '%corn%';

-- Herbs category updates
UPDATE products SET image = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop' WHERE category = 'herbs' AND name ILIKE '%basil%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1628556276832-e0631b1c3d26?w=400&h=400&fit=crop' WHERE category = 'herbs' AND name ILIKE '%cilantro%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1607874465412-4d8e0b9b7a9b?w=400&h=400&fit=crop' WHERE category = 'herbs' AND name ILIKE '%parsley%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' WHERE category = 'herbs' AND name ILIKE '%thyme%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1515426433867-a89e2ebc5f35?w=400&h=400&fit=crop' WHERE category = 'herbs' AND name ILIKE '%rosemary%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1594788166544-4c5b4d50dfc5?w=400&h=400&fit=crop' WHERE category = 'herbs' AND name ILIKE '%mint%';

-- Seafood category updates
UPDATE products SET image = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=400&fit=crop' WHERE category = 'seafood' AND name ILIKE '%salmon%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop' WHERE category = 'seafood' AND name ILIKE '%bass%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop' WHERE category = 'seafood' AND name ILIKE '%shrimp%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1558618047-fcd9c8d65499?w=400&h=400&fit=crop' WHERE category = 'seafood' AND name ILIKE '%crab%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd61?w=400&h=400&fit=crop' WHERE category = 'seafood' AND name ILIKE '%fish%';

-- Pantry category updates
UPDATE products SET image = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop' WHERE category = 'pantry' AND name ILIKE '%honey%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1566336810609-097ea2ee2604?w=400&h=400&fit=crop' WHERE category = 'pantry' AND name ILIKE '%olive%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop' WHERE category = 'pantry' AND (name ILIKE '%bread%' OR name ILIKE '%sourdough%');
UPDATE products SET image = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop' WHERE category = 'pantry' AND name ILIKE '%jam%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop' WHERE category = 'pantry' AND name ILIKE '%pasta%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=400&fit=crop' WHERE category = 'pantry' AND name ILIKE '%rice%';

-- Protein category updates
UPDATE products SET image = 'https://images.unsplash.com/photo-1606756790138-261d2b21cd02?w=400&h=400&fit=crop' WHERE category = 'protein' AND name ILIKE '%chicken%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop' WHERE category = 'protein' AND name ILIKE '%beef%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1602473459862-5d8e9c5f8326?w=400&h=400&fit=crop' WHERE category = 'protein' AND name ILIKE '%pork%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=400&fit=crop' WHERE category = 'protein' AND name ILIKE '%egg%';
UPDATE products SET image = 'https://images.unsplash.com/photo-1628088062854-6072ac5c3db0?w=400&h=400&fit=crop' WHERE category = 'protein' AND name ILIKE '%tofu%';

-- Update any remaining products without images using category defaults
UPDATE products SET image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop' WHERE image IS NULL AND category = 'produce';
UPDATE products SET image = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop' WHERE image IS NULL AND category = 'herbs';
UPDATE products SET image = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=400&fit=crop' WHERE image IS NULL AND category = 'seafood';
UPDATE products SET image = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop' WHERE image IS NULL AND category = 'pantry';
UPDATE products SET image = 'https://images.unsplash.com/photo-1606756790138-261d2b21cd02?w=400&h=400&fit=crop' WHERE image IS NULL AND category = 'protein';

-- Final fallback for any products that still don't have images
UPDATE products SET image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop' WHERE image IS NULL;
