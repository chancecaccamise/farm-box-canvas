-- Insert 4 fishing partners into the partners table
INSERT INTO public.partners (name, slug, category, location, is_active, description, bio, story, specialties, rating)
VALUES 
-- Townsend, GA partners
('Phillip''s Seafood', 'phillips-seafood', 'fisherman', 'Townsend, GA', true, 
 'Fresh local seafood from Townsend', 
 'Description pending', 
 'Story pending', 
 ARRAY['Fresh Catch', 'Local Seafood'], 
 5.0),
 
('Sapelo Sea Farms', 'sapelo-sea-farms', 'fisherman', 'Townsend, GA', true,
 'Sustainable seafood farming in Townsend',
 'Description pending',
 'Story pending',
 ARRAY['Sustainable Farming', 'Fresh Seafood'],
 5.0),

-- Brunswick, GA partner
('Anchored Shrimp Co', 'anchored-shrimp-co', 'fisherman', 'Brunswick, GA', true,
 'Fresh shrimp from Brunswick waters',
 'Description pending',
 'Story pending',
 ARRAY['Fresh Shrimp', 'Local Catch'],
 5.0),

-- Hampstead, NC partner
('Atlantic Seafood', 'atlantic-seafood', 'fisherman', 'Hampstead, NC', true,
 'Quality seafood from the Atlantic coast',
 'Description pending',
 'Story pending',
 ARRAY['Fresh Catch', 'Atlantic Seafood'],
 5.0);