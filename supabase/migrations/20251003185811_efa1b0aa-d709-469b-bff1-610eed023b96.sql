-- Fix the specific protein pack order by linking it to the existing bag and updating selections
DO $$
DECLARE
  v_bag_id UUID;
  v_order_id UUID := '6dfe0de2-e467-4302-bd91-701b9e155bc4';
  v_user_id UUID := '257b8424-eeb7-44b8-970f-3c3d3928256c';
BEGIN
  -- Find the existing bag for this user/week
  SELECT id INTO v_bag_id
  FROM public.weekly_bags
  WHERE user_id = v_user_id
    AND week_start_date = '2025-09-29';
  
  IF v_bag_id IS NULL THEN
    RAISE NOTICE 'No bag found for this week, skipping';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found bag %, updating with protein selections', v_bag_id;
  
  -- Update the bag with protein selections from the order
  UPDATE public.weekly_bags
  SET user_protein_selections = ARRAY[
    'a2afe298-43f7-49dd-9aa5-5db24c01e288'::uuid,
    'a2afe298-43f7-49dd-9aa5-5db24c01e288'::uuid,
    '43868aa0-4c92-4d29-a1d4-11a4882d093c'::uuid,
    '47761322-aacc-47cb-9118-f56da0c799a7'::uuid,
    '0fc6f905-e7d7-42bb-a140-dd67b37b4f01'::uuid
  ],
  box_size = 'protein-pack'
  WHERE id = v_bag_id;
  
  -- Link the order to the bag
  UPDATE public.orders
  SET weekly_bag_id = v_bag_id
  WHERE id = v_order_id;
  
  RAISE NOTICE 'Updated bag and order successfully';
  
END $$;