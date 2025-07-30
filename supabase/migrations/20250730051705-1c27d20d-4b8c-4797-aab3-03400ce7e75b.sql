-- Fix box size naming inconsistency by swapping the names to match logical pricing
-- Currently: name='large' has $50 price (should be medium), name='medium' has $70 price (should be large)

UPDATE public.box_sizes 
SET name = 'medium' 
WHERE base_price = 50.00 AND name = 'large';

UPDATE public.box_sizes 
SET name = 'large' 
WHERE base_price = 70.00 AND name = 'medium';