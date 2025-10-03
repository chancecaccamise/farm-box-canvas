-- Backfill user selections from paid orders to weekly_bags
-- This ensures existing customers see their historical selections

UPDATE weekly_bags wb
SET 
  user_protein_selections = o.user_protein_selections,
  user_full_farm_bag_protein = o.user_full_farm_bag_protein,
  user_full_farm_bag_carb = o.user_full_farm_bag_carb
FROM orders o
WHERE wb.id = o.weekly_bag_id
  AND o.payment_status = 'paid'
  AND (
    (wb.box_size = 'protein-pack' AND o.user_protein_selections IS NOT NULL AND wb.user_protein_selections IS NULL)
    OR (wb.box_size = 'full_farm_bag' AND (
      (o.user_full_farm_bag_protein IS NOT NULL AND wb.user_full_farm_bag_protein IS NULL)
      OR (o.user_full_farm_bag_carb IS NOT NULL AND wb.user_full_farm_bag_carb IS NULL)
    ))
  );