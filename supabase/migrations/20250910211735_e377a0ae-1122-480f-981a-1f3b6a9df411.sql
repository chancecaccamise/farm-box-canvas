-- Update Protein Billy's Bag pricing from $89.99/$79.99 to $100/$95
UPDATE public.box_sizes 
SET 
  base_price = 100.00,
  subscriber_price = 95.00,
  display_name = 'Protein Billy''s Bag',
  description = '5 customer choice protein selections from seafood and alternate proteins, valued at about $100'
WHERE name = 'protein-pack';

-- Update Full Billy's Bag display name and description
UPDATE public.box_sizes 
SET 
  display_name = 'Full Billy''s Bag',
  description = '8 items - mix of eggs, products, veggies, and 1 protein, valued at about $50'
WHERE name = 'full_farm_bag';

-- Update Veggie Billy's Bag display name and description  
UPDATE public.box_sizes 
SET 
  display_name = 'Veggie Billy''s Bag',
  description = '6 items, all veggies - mix of veggies, valued at about $25'
WHERE name = 'veggie_bag';