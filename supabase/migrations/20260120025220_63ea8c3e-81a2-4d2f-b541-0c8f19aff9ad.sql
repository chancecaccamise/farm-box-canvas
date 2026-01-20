-- Clear full_farm_bag fields from protein-pack orders (these fields should only be used for full_farm_bag)
UPDATE orders
SET 
  user_full_farm_bag_protein = NULL,
  user_full_farm_bag_carb = NULL
WHERE box_size = 'protein-pack'
  AND (user_full_farm_bag_protein IS NOT NULL OR user_full_farm_bag_carb IS NOT NULL);

-- Also clean up weekly_bags table for consistency
UPDATE weekly_bags
SET 
  user_full_farm_bag_protein = NULL,
  user_full_farm_bag_carb = NULL
WHERE box_size = 'protein-pack'
  AND (user_full_farm_bag_protein IS NOT NULL OR user_full_farm_bag_carb IS NOT NULL);