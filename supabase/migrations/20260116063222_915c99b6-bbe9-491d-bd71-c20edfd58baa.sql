-- Sync selections from weekly_bags to orders for current week (2026-01-12)
UPDATE orders o
SET 
  user_full_farm_bag_protein = wb.user_full_farm_bag_protein,
  user_full_farm_bag_carb = wb.user_full_farm_bag_carb,
  user_protein_selections = wb.user_protein_selections,
  user_carb_selections = wb.user_carb_selections
FROM weekly_bags wb
WHERE o.weekly_bag_id = wb.id
  AND o.week_start_date = '2026-01-12'
  AND wb.id IS NOT NULL;