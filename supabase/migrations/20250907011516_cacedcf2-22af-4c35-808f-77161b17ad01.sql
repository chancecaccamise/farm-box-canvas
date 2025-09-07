-- Clean up box sizes - keep only the 3 main bags
-- Remove inactive old boxes
DELETE FROM public.box_sizes WHERE name IN ('small', 'medium', 'large') AND is_active = false;

-- Remove duplicate protein pack (keep the protein-pack, remove protein_pack)
DELETE FROM public.box_sizes WHERE name = 'protein_pack' AND base_price = 100.00;

-- Update the remaining boxes with proper descriptions and "What's Included" content
UPDATE public.box_sizes SET 
  display_name = 'Veggie Bag',
  description = '6 fresh vegetables hand-selected by Billy from local farms'
WHERE name = 'veggie_bag';

UPDATE public.box_sizes SET 
  display_name = 'Full Farm Bag', 
  description = 'Complete farm experience with vegetables, proteins, pantry goods, and a weekly complimentary gift'
WHERE name = 'full_farm_bag';

UPDATE public.box_sizes SET 
  display_name = 'Protein Pack',
  description = 'Choose 5 premium proteins from our weekly selection of fresh seafood and locally-sourced meats'
WHERE name = 'protein-pack';