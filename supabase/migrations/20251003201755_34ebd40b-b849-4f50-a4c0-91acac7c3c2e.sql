-- Fix bag to use most recent order's selections
-- This repairs the issue where multiple orders for the same week caused the bag to show old selections

DO $$
DECLARE
  v_bag_id UUID := '9fcb4144-952c-4b57-a665-bc8f87423457';
  v_user_id UUID := '257b8424-eeb7-44b8-970f-3c3d3928256c';
  v_most_recent_order RECORD;
BEGIN
  -- Get the most recent paid order for this bag
  SELECT 
    user_protein_selections,
    user_full_farm_bag_protein,
    user_full_farm_bag_carb,
    box_size,
    created_at
  INTO v_most_recent_order
  FROM orders
  WHERE user_id = v_user_id
    AND weekly_bag_id = v_bag_id
    AND payment_status = 'paid'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_most_recent_order IS NULL THEN
    RAISE NOTICE 'No paid orders found for this bag';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Updating bag with most recent order from %', v_most_recent_order.created_at;
  
  -- Update bag with most recent order's selections
  UPDATE weekly_bags
  SET user_protein_selections = v_most_recent_order.user_protein_selections,
      user_full_farm_bag_protein = v_most_recent_order.user_full_farm_bag_protein,
      user_full_farm_bag_carb = v_most_recent_order.user_full_farm_bag_carb
  WHERE id = v_bag_id;
  
  -- Repopulate bag items from template with correct selections
  PERFORM populate_weekly_bag_from_template(
    v_bag_id,
    v_most_recent_order.box_size,
    '2025-09-29'
  );
  
  RAISE NOTICE 'Successfully fixed bag with correct selections';
END $$;