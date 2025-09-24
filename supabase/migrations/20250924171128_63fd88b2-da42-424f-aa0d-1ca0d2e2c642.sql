-- Backfill enhanced order data from weekly_bags for existing orders
UPDATE public.orders 
SET 
  user_protein_selections = wb.user_protein_selections,
  user_carb_selections = wb.user_carb_selections,
  user_full_farm_bag_protein = wb.user_full_farm_bag_protein,
  user_full_farm_bag_carb = wb.user_full_farm_bag_carb
FROM public.weekly_bags wb
WHERE orders.weekly_bag_id = wb.id 
  AND orders.weekly_bag_id IS NOT NULL
  AND (
    orders.user_protein_selections IS NULL OR
    orders.user_carb_selections IS NULL OR
    orders.user_full_farm_bag_protein IS NULL OR
    orders.user_full_farm_bag_carb IS NULL
  );