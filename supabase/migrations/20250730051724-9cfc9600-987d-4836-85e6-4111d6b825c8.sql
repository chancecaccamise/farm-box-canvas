-- Fix box size naming inconsistency using temporary names to avoid constraint violations
-- Step 1: Update to temporary names
UPDATE public.box_sizes 
SET name = 'temp_medium' 
WHERE base_price = 50.00 AND name = 'large';

UPDATE public.box_sizes 
SET name = 'temp_large' 
WHERE base_price = 70.00 AND name = 'medium';

-- Step 2: Update to correct final names
UPDATE public.box_sizes 
SET name = 'medium' 
WHERE name = 'temp_medium';

UPDATE public.box_sizes 
SET name = 'large' 
WHERE name = 'temp_large';