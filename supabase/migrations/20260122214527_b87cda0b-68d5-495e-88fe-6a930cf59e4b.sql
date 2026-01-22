UPDATE orders 
SET 
  box_price = 50.00,
  total_amount = total_amount - 5.00,
  user_full_farm_bag_protein = '47761322-aacc-47cb-9118-f56da0c799a7',
  user_full_farm_bag_carb = '7c05ca7b-c536-4a45-a0f1-90ffdc19fd6b',
  weekly_bag_id = '16bc6e43-d719-45ea-8269-52d56c67670d',
  updated_at = now()
WHERE id = '19e6463b-71ff-47fe-afe0-a834fc224135';