-- Add sample product images for better display
UPDATE products SET image = 'leafy-greens.jpg' WHERE category = 'Produce' AND name LIKE '%greens%';
UPDATE products SET image = 'tomatoes.jpg' WHERE category = 'Produce' AND name LIKE '%tomato%';
UPDATE products SET image = 'rainbow-carrots.jpg' WHERE category = 'Produce' AND name LIKE '%carrot%';
UPDATE products SET image = 'bell-peppers.jpg' WHERE category = 'Produce' AND name LIKE '%pepper%';

-- Update some sample products with better descriptions if they exist
UPDATE products SET description = 'Fresh, crisp leafy greens perfect for salads and cooking' WHERE name LIKE '%greens%' AND description IS NULL;
UPDATE products SET description = 'Juicy, vine-ripened tomatoes bursting with flavor' WHERE name LIKE '%tomato%' AND description IS NULL;
UPDATE products SET description = 'Sweet, colorful carrots freshly harvested from our fields' WHERE name LIKE '%carrot%' AND description IS NULL;
UPDATE products SET description = 'Vibrant bell peppers in assorted colors, perfect for cooking' WHERE name LIKE '%pepper%' AND description IS NULL;