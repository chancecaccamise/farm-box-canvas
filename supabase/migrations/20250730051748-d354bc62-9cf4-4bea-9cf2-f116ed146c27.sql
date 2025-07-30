-- Fix box size naming by updating all related tables in proper order
-- First update box_templates to use temporary names
UPDATE public.box_templates 
SET box_size = 'temp_medium' 
WHERE box_size = 'large';

UPDATE public.box_templates 
SET box_size = 'temp_large' 
WHERE box_size = 'medium';

-- Then update box_sizes
UPDATE public.box_sizes 
SET name = 'temp_medium_final' 
WHERE base_price = 50.00 AND name = 'large';

UPDATE public.box_sizes 
SET name = 'temp_large_final' 
WHERE base_price = 70.00 AND name = 'medium';

-- Update box_sizes to final names
UPDATE public.box_sizes 
SET name = 'medium' 
WHERE name = 'temp_medium_final';

UPDATE public.box_sizes 
SET name = 'large' 
WHERE name = 'temp_large_final';

-- Finally update box_templates to final names
UPDATE public.box_templates 
SET box_size = 'medium' 
WHERE box_size = 'temp_medium';

UPDATE public.box_templates 
SET box_size = 'large' 
WHERE box_size = 'temp_large';