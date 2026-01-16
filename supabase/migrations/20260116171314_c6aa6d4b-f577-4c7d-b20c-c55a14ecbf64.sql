-- One-time fix: Update current week's orders with selections from previous orders
-- This finds orders missing selections and copies from the user's most recent order that has them

UPDATE orders o
SET 
  user_full_farm_bag_protein = prev.user_full_farm_bag_protein,
  user_full_farm_bag_carb = prev.user_full_farm_bag_carb,
  user_protein_selections = prev.user_protein_selections,
  user_carb_selections = prev.user_carb_selections
FROM (
  SELECT DISTINCT ON (o2.user_id)
    o2.user_id,
    o2.user_full_farm_bag_protein,
    o2.user_full_farm_bag_carb,
    o2.user_protein_selections,
    o2.user_carb_selections
  FROM orders o2
  WHERE o2.week_start_date < '2026-01-12'
    AND (o2.user_full_farm_bag_protein IS NOT NULL 
         OR o2.user_protein_selections IS NOT NULL)
  ORDER BY o2.user_id, o2.week_start_date DESC
) prev
WHERE o.week_start_date = '2026-01-12'
  AND o.user_id = prev.user_id
  AND o.user_full_farm_bag_protein IS NULL
  AND o.user_protein_selections IS NULL;