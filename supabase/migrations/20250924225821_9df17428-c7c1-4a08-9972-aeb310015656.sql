-- Update the populate_weekly_bag_from_template function to fix Full Farm Bag display
CREATE OR REPLACE FUNCTION public.populate_weekly_bag_from_template(bag_id uuid, box_size_name text, week_start date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  template_record RECORD;
  box_price_amount DECIMAL(10,2);
  template_week_to_use DATE;
  has_confirmed_templates BOOLEAN := false;
  has_any_templates BOOLEAN := false;
  bag_data RECORD;
BEGIN
  -- Get bag data including user selections
  SELECT * INTO bag_data
  FROM public.weekly_bags
  WHERE id = bag_id;

  -- Get box price
  SELECT base_price INTO box_price_amount
  FROM public.box_sizes
  WHERE name = box_size_name;
  
  -- Update weekly bag with box size and price
  UPDATE public.weekly_bags
  SET box_size = box_size_name,
      box_price = box_price_amount
  WHERE id = bag_id;
  
  -- Remove existing box items and user-selected items (keep add-ons)
  DELETE FROM public.weekly_bag_items
  WHERE weekly_bag_id = bag_id 
  AND item_type IN ('box_item', 'user_selected_protein', 'user_selected_carb');

  -- Handle different box types
  IF box_size_name = 'full_farm_bag' THEN
    -- Full Farm Bag: Add user-selected protein and carb, then ALL template items
    
    -- Add user-selected protein if exists
    IF bag_data.user_full_farm_bag_protein IS NOT NULL THEN
      INSERT INTO public.weekly_bag_items (
        weekly_bag_id, product_id, quantity, price_at_time, item_type
      )
      SELECT bag_id, bag_data.user_full_farm_bag_protein, 1, p.price, 'user_selected_protein'
      FROM public.products p
      WHERE p.id = bag_data.user_full_farm_bag_protein::uuid;
    END IF;

    -- Add user-selected carb if exists  
    IF bag_data.user_full_farm_bag_carb IS NOT NULL THEN
      INSERT INTO public.weekly_bag_items (
        weekly_bag_id, product_id, quantity, price_at_time, item_type
      )
      SELECT bag_id, bag_data.user_full_farm_bag_carb, 1, p.price, 'user_selected_carb'
      FROM public.products p
      WHERE p.id = bag_data.user_full_farm_bag_carb::uuid;
    END IF;

    -- Add ALL items from admin template (no category restriction, no limit)
    SELECT EXISTS(
      SELECT 1 FROM public.box_templates bt
      WHERE bt.week_start_date = week_start 
        AND bt.box_size = box_size_name
        AND bt.is_confirmed = true
    ) INTO has_confirmed_templates;

    IF has_confirmed_templates THEN
      template_week_to_use := week_start;
    ELSE
      -- Use most recent confirmed template
      SELECT MAX(bt.week_start_date) INTO template_week_to_use
      FROM public.box_templates bt
      WHERE bt.week_start_date <= week_start 
        AND bt.box_size = box_size_name
        AND bt.is_confirmed = true;
    END IF;

    -- Add ALL template items (exclude user-selected items to avoid duplicates)
    IF template_week_to_use IS NOT NULL THEN
      FOR template_record IN
        SELECT bt.product_id, bt.quantity, p.price
        FROM public.box_templates bt
        JOIN public.products p ON p.id = bt.product_id
        WHERE bt.week_start_date = template_week_to_use 
          AND bt.box_size = box_size_name
          AND bt.is_confirmed = true
          AND p.id NOT IN (
            COALESCE(bag_data.user_full_farm_bag_protein::uuid, '00000000-0000-0000-0000-000000000000'),
            COALESCE(bag_data.user_full_farm_bag_carb::uuid, '00000000-0000-0000-0000-000000000000')
          )
      LOOP
        INSERT INTO public.weekly_bag_items (
          weekly_bag_id, product_id, quantity, price_at_time, item_type
        ) VALUES (
          bag_id, template_record.product_id, template_record.quantity, template_record.price, 'box_item'
        );
      END LOOP;
    END IF;

  ELSIF box_size_name = 'protein-pack' THEN
    -- Protein Pack: Add all 5 user-selected proteins
    IF bag_data.user_protein_selections IS NOT NULL THEN
      FOR template_record IN
        SELECT p.id, p.price
        FROM public.products p
        WHERE p.id = ANY(bag_data.user_protein_selections::uuid[])
        LIMIT 5
      LOOP
        INSERT INTO public.weekly_bag_items (
          weekly_bag_id, product_id, quantity, price_at_time, item_type
        ) VALUES (
          bag_id, template_record.id, 1, template_record.price, 'user_selected_protein'
        );
      END LOOP;
    END IF;

  ELSE
    -- Regular boxes (small, medium, large): Use admin templates as before
    SELECT EXISTS(
      SELECT 1 FROM public.box_templates bt
      WHERE bt.week_start_date = week_start 
        AND bt.box_size = box_size_name
        AND bt.is_confirmed = true
    ) INTO has_confirmed_templates;
    
    SELECT EXISTS(
      SELECT 1 FROM public.box_templates bt
      WHERE bt.week_start_date = week_start 
        AND bt.box_size = box_size_name
    ) INTO has_any_templates;
    
    IF has_confirmed_templates THEN
      template_week_to_use := week_start;
      
      FOR template_record IN
        SELECT bt.product_id, bt.quantity, p.price
        FROM public.box_templates bt
        JOIN public.products p ON p.id = bt.product_id
        WHERE bt.week_start_date = template_week_to_use 
          AND bt.box_size = box_size_name
          AND bt.is_confirmed = true
      LOOP
        INSERT INTO public.weekly_bag_items (
          weekly_bag_id, product_id, quantity, price_at_time, item_type
        ) VALUES (
          bag_id, template_record.product_id, template_record.quantity, template_record.price, 'box_item'
        );
      END LOOP;
      
    ELSIF has_any_templates THEN
      template_week_to_use := week_start;
      
      FOR template_record IN
        SELECT bt.product_id, bt.quantity, p.price
        FROM public.box_templates bt
        JOIN public.products p ON p.id = bt.product_id
        WHERE bt.week_start_date = template_week_to_use 
          AND bt.box_size = box_size_name
      LOOP
        INSERT INTO public.weekly_bag_items (
          weekly_bag_id, product_id, quantity, price_at_time, item_type
        ) VALUES (
          bag_id, template_record.product_id, template_record.quantity, template_record.price, 'box_item'
        );
      END LOOP;
      
    ELSE
      -- Look for the most recent confirmed template
      SELECT MAX(bt.week_start_date) INTO template_week_to_use
      FROM public.box_templates bt
      WHERE bt.week_start_date <= week_start 
        AND bt.box_size = box_size_name
        AND bt.is_confirmed = true;
      
      IF template_week_to_use IS NOT NULL THEN
        FOR template_record IN
          SELECT bt.product_id, bt.quantity, p.price
          FROM public.box_templates bt
          JOIN public.products p ON p.id = bt.product_id
          WHERE bt.week_start_date = template_week_to_use 
            AND bt.box_size = box_size_name
            AND bt.is_confirmed = true
        LOOP
          INSERT INTO public.weekly_bag_items (
            weekly_bag_id, product_id, quantity, price_at_time, item_type
          ) VALUES (
            bag_id, template_record.product_id, template_record.quantity, template_record.price, 'box_item'
          );
        END LOOP;
      END IF;
    END IF;
  END IF;
  
  -- Recalculate totals
  PERFORM update_weekly_bag_totals(bag_id);
END;
$function$