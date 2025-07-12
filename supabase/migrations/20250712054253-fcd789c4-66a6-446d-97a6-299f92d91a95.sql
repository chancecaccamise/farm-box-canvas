-- Insert products needed for checkout flow (only if they don't exist)
INSERT INTO public.products (name, description, category, price, image, is_available, inventory_count) 
SELECT * FROM (VALUES
  ('Bell Pepper Trio', 'Red, yellow, and orange sweet peppers', 'produce', 4.99, '/assets/bell-peppers.jpg', true, 100),
  ('Leafy Greens Mix', 'Fresh spinach, arugula, and baby kale', 'produce', 3.99, '/assets/leafy-greens.jpg', true, 100),
  ('Heritage Tomatoes', 'Colorful heirloom varieties, vine-ripened', 'produce', 5.99, '/assets/tomatoes.jpg', true, 100),
  ('Rainbow Carrots', 'Purple, orange, and yellow heritage carrots', 'produce', 3.49, '/assets/rainbow-carrots.jpg', true, 100),
  ('Grass-Fed Ground Beef', '1 lb locally sourced grass-fed beef', 'protein', 12.99, null, true, 100),
  ('Free-Range Chicken Breast', '2 lbs organic free-range chicken', 'protein', 15.99, null, true, 100),
  ('Wild-Caught Salmon', '1.5 lbs Alaskan wild salmon fillets', 'protein', 24.99, null, true, 100),
  ('Extra Virgin Olive Oil', '500ml cold-pressed olive oil', 'pantry', 12.99, null, true, 100),
  ('Artisan Cheese Selection', '3 varieties of local farmstead cheese', 'pantry', 16.99, null, true, 100),
  ('Artisan Bread Box', 'Assorted artisan breads and pastries', 'pantry', 14.99, null, true, 100),
  ('Fresh Herb Bundle', 'Seasonal fresh herbs from local farms', 'produce', 7.99, null, true, 100),
  ('Premium Manuka Honey', 'High-grade Manuka honey from New Zealand', 'pantry', 24.99, null, true, 100)
) AS v(name, description, category, price, image, is_available, inventory_count)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products p WHERE p.name = v.name
);