-- Drop the old restrictive constraint
ALTER TABLE weekly_bag_items DROP CONSTRAINT IF EXISTS weekly_bag_items_item_type_check;

-- One-time repair: Link the protein pack order to the bag and repopulate
DO $$
DECLARE
  v_bag_id UUID;
  v_order_id UUID := '8cd1268c-f9fc-4696-8477-3a5a0ba24fff';
  v_user_id UUID := '257b8424-eeb7-44b8-970f-3c3d3928256c';
  v_week_start DATE := '2025-09-29';
BEGIN
  -- Find the existing bag for this user/week
  SELECT id INTO v_bag_id
  FROM public.weekly_bags
  WHERE user_id = v_user_id
    AND week_start_date = v_week_start;
  
  IF v_bag_id IS NULL THEN
    RAISE NOTICE 'No bag found for this week';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found bag %, linking order and repopulating', v_bag_id;
  
  -- Link the order to the bag
  UPDATE public.orders
  SET weekly_bag_id = v_bag_id
  WHERE id = v_order_id;
  
  -- Force repopulation of bag items with user selections
  DELETE FROM public.weekly_bag_items
  WHERE weekly_bag_id = v_bag_id
    AND item_type IN ('box_item', 'user_selected_protein');
  
  -- Call populate function to add the 5 proteins from user_protein_selections
  PERFORM populate_weekly_bag_from_template(v_bag_id, 'protein-pack', v_week_start);
  
  RAISE NOTICE 'Successfully linked order and repopulated bag';
  
END $$;