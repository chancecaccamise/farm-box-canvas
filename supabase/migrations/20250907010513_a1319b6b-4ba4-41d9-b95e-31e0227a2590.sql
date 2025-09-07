-- Add some protein products for the seafood protein pack
INSERT INTO public.products (name, description, category, price, unit_description, image, tags, is_available) VALUES
('Wild Alaskan Salmon Fillet', 'Fresh wild-caught salmon fillet, sustainably sourced from Alaskan waters', 'proteins', 18.99, '1 lb fillet', null, ARRAY['seafood', 'wild-caught', 'sustainable'], true),
('Atlantic Cod Fillet', 'Premium Atlantic cod fillet, mild flavor and flaky texture', 'proteins', 15.99, '1 lb fillet', null, ARRAY['seafood', 'mild'], true),
('Sea Scallops', 'Large, fresh sea scallops perfect for searing', 'proteins', 22.99, '1 lb (10-12 pieces)', null, ARRAY['seafood', 'premium'], true),
('Mahi Mahi Fillet', 'Fresh mahi mahi with firm texture and mild flavor', 'proteins', 16.99, '1 lb fillet', null, ARRAY['seafood', 'tropical'], true),
('Wild Shrimp', 'Large wild-caught shrimp, peeled and deveined', 'proteins', 19.99, '1 lb (16-20 count)', null, ARRAY['seafood', 'wild-caught'], true),
('Lobster Tail', 'Fresh Maine lobster tails', 'proteins', 28.99, '2 tails (6-8 oz each)', null, ARRAY['seafood', 'premium', 'maine'], true),
('Halibut Fillet', 'Premium Pacific halibut fillet', 'proteins', 24.99, '1 lb fillet', null, ARRAY['seafood', 'premium', 'pacific'], true),
('Swordfish Steak', 'Fresh swordfish steak, meaty texture', 'proteins', 20.99, '1 lb steak', null, ARRAY['seafood', 'steak'], true),
('Tuna Steak', 'Fresh yellowfin tuna steak, sashimi grade', 'proteins', 26.99, '1 lb steak', null, ARRAY['seafood', 'premium', 'sashimi-grade'], true),
('Red Snapper Fillet', 'Fresh red snapper fillet with delicate flavor', 'proteins', 17.99, '1 lb fillet', null, ARRAY['seafood', 'delicate'], true);