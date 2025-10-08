-- Enhanced populate_weekly_bag_from_template function with comprehensive logging and fixes

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
  item_type_to_use TEXT;
  template_count INTEGER := 0;
  inserted_count INTEGER := 0;
  excluded_protein_id UUID;
  excluded_carb_id UUID;
BEGIN
  RAISE NOTICE '[POPULATE_BAG] Starting for bag_id: %, box_size: %, week_start: %', bag_id, box_size_name, week_start;

  -- Get bag data including user selections
  SELECT * INTO bag_data
  FROM public.weekly_bags
  WHERE id = bag_id;

  RAISE NOTICE '[POPULATE_BAG] Bag data retrieved - user_protein: %, user_carb: %', 
    bag_data.user_full_farm_bag_protein, bag_data.user_full_farm_bag_carb;

  -- Get box price
  SELECT base_price INTO box_price_amount
  FROM public.box_sizes
  WHERE name = box_size_name;
  
  -- Update weekly bag with box size and price
  UPDATE public.weekly_bags
  SET box_size = box_size_name,
      box_price = box_price_amount
  WHERE id = bag_id;
  
  RAISE NOTICE '[POPULATE_BAG] Updated bag with box_size: % and price: %', box_size_name, box_price_amount;
  
  -- Remove ALL existing items (box items, user selections, and add-ons to be safe)
  DELETE FROM public.weekly_bag_items
  WHERE weekly_bag_id = bag_id;

  RAISE NOTICE '[POPULATE_BAG] Cleared all existing items';

  -- Handle different box types
  IF box_size_name = 'full_farm_bag' THEN
    RAISE NOTICE '[POPULATE_BAG] Processing Full Farm Bag';
    
    -- Add user-selected protein if exists
    IF bag_data.user_full_farm_bag_protein IS NOT NULL THEN
      INSERT INTO public.weekly_bag_items (
        weekly_bag_id, product_id, quantity, price_at_time, item_type
      )
      SELECT bag_id, bag_data.user_full_farm_bag_protein::uuid, 1, p.price, 'user_selected_protein'
      FROM public.products p
      WHERE p.id = bag_data.user_full_farm_bag_protein::uuid;
      
      RAISE NOTICE '[POPULATE_BAG] Added user-selected protein: %', bag_data.user_full_farm_bag_protein;
    END IF;

    -- Add user-selected carb if exists  
    IF bag_data.user_full_farm_bag_carb IS NOT NULL THEN
      INSERT INTO public.weekly_bag_items (
        weekly_bag_id, product_id, quantity, price_at_time, item_type
      )
      SELECT bag_id, bag_data.user_full_farm_bag_carb::uuid, 1, p.price, 'user_selected_carb'
      FROM public.products p
      WHERE p.id = bag_data.user_full_farm_bag_carb::uuid;
      
      RAISE NOTICE '[POPULATE_BAG] Added user-selected carb: %', bag_data.user_full_farm_bag_carb;
    END IF;

    -- Store excluded IDs for cleaner logic
    excluded_protein_id := COALESCE(bag_data.user_full_farm_bag_protein::uuid, '00000000-0000-0000-0000-000000000000'::uuid);
    excluded_carb_id := COALESCE(bag_data.user_full_farm_bag_carb::uuid, '00000000-0000-0000-0000-000000000000'::uuid);

    RAISE NOTICE '[POPULATE_BAG] Excluded IDs - protein: %, carb: %', excluded_protein_id, excluded_carb_id;

    -- Find the template to use
    SELECT EXISTS(
      SELECT 1 FROM public.box_templates bt
      WHERE bt.week_start_date = week_start 
        AND bt.box_size = box_size_name
        AND bt.is_confirmed = true
    ) INTO has_confirmed_templates;

    RAISE NOTICE '[POPULATE_BAG] Has confirmed templates for this week: %', has_confirmed_templates;

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

    RAISE NOTICE '[POPULATE_BAG] Template week to use: %', template_week_to_use;

    -- Count available template items
    SELECT COUNT(*) INTO template_count
    FROM public.box_templates bt
    WHERE bt.week_start_date = template_week_to_use 
      AND bt.box_size = box_size_name
      AND bt.is_confirmed = true
      AND bt.product_id NOT IN (excluded_protein_id, excluded_carb_id);

    RAISE NOTICE '[POPULATE_BAG] Found % template items (after exclusions)', template_count;

    -- Add ALL template items (exclude user-selected items to avoid duplicates)
    IF template_week_to_use IS NOT NULL THEN
      FOR template_record IN
        SELECT bt.product_id, bt.quantity, p.price, p.category, p.name
        FROM public.box_templates bt
        JOIN public.products p ON p.id = bt.product_id
        WHERE bt.week_start_date = template_week_to_use 
          AND bt.box_size = box_size_name
          AND bt.is_confirmed = true
          AND bt.product_id NOT IN (excluded_protein_id, excluded_carb_id)
        ORDER BY p.name
      LOOP
        -- Determine item type based on product category
        IF template_record.category = 'addons' THEN
          item_type_to_use := 'addon';
        ELSE
          item_type_to_use := 'box_item';
        END IF;
        
        INSERT INTO public.weekly_bag_items (
          weekly_bag_id, product_id, quantity, price_at_time, item_type
        ) VALUES (
          bag_id, template_record.product_id, template_record.quantity, template_record.price, item_type_to_use
        );

        inserted_count := inserted_count + 1;
        RAISE NOTICE '[POPULATE_BAG] Inserted template item %: % (%, qty: %)', 
          inserted_count, template_record.name, item_type_to_use, template_record.quantity;
      END LOOP;

      RAISE NOTICE '[POPULATE_BAG] Total template items inserted: %', inserted_count;
    ELSE
      RAISE WARNING '[POPULATE_BAG] No template week found for Full Farm Bag!';
    END IF;

  ELSIF box_size_name = 'protein-pack' THEN
    RAISE NOTICE '[POPULATE_BAG] Processing Protein Pack';
    
    -- Protein Pack: Count duplicates and add with correct quantities
    IF bag_data.user_protein_selections IS NOT NULL THEN
      INSERT INTO public.weekly_bag_items (
        weekly_bag_id, product_id, quantity, price_at_time, item_type
      )
      SELECT 
        bag_id,
        p.id,
        COUNT(*)::integer as quantity,
        p.price,
        'user_selected_protein'
      FROM unnest(bag_data.user_protein_selections::uuid[]) AS selection_id
      JOIN public.products p ON p.id = selection_id
      GROUP BY p.id, p.price;
      
      RAISE NOTICE '[POPULATE_BAG] Added protein pack selections';
    END IF;

  ELSE
    RAISE NOTICE '[POPULATE_BAG] Processing regular box: %', box_size_name;
    
    -- Regular boxes (small, medium, large, veggie-bag): Use admin templates
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
    
    RAISE NOTICE '[POPULATE_BAG] Has confirmed: %, Has any: %', has_confirmed_templates, has_any_templates;
    
    IF has_confirmed_templates THEN
      template_week_to_use := week_start;
      
      FOR template_record IN
        SELECT bt.product_id, bt.quantity, p.price, p.category, p.name
        FROM public.box_templates bt
        JOIN public.products p ON p.id = bt.product_id
        WHERE bt.week_start_date = template_week_to_use 
          AND bt.box_size = box_size_name
          AND bt.is_confirmed = true
      LOOP
        IF template_record.category = 'addons' THEN
          item_type_to_use := 'addon';
        ELSE
          item_type_to_use := 'box_item';
        END IF;
        
        INSERT INTO public.weekly_bag_items (
          weekly_bag_id, product_id, quantity, price_at_time, item_type
        ) VALUES (
          bag_id, template_record.product_id, template_record.quantity, template_record.price, item_type_to_use
        );
        
        inserted_count := inserted_count + 1;
        RAISE NOTICE '[POPULATE_BAG] Inserted: % (%)', template_record.name, item_type_to_use;
      END LOOP;
      
    ELSIF has_any_templates THEN
      template_week_to_use := week_start;
      
      FOR template_record IN
        SELECT bt.product_id, bt.quantity, p.price, p.category
        FROM public.box_templates bt
        JOIN public.products p ON p.id = bt.product_id
        WHERE bt.week_start_date = template_week_to_use 
          AND bt.box_size = box_size_name
      LOOP
        IF template_record.category = 'addons' THEN
          item_type_to_use := 'addon';
        ELSE
          item_type_to_use := 'box_item';
        END IF;
        
        INSERT INTO public.weekly_bag_items (
          weekly_bag_id, product_id, quantity, price_at_time, item_type
        ) VALUES (
          bag_id, template_record.product_id, template_record.quantity, template_record.price, item_type_to_use
        );
        
        inserted_count := inserted_count + 1;
      END LOOP;
      
    ELSE
      -- Look for the most recent confirmed template
      SELECT MAX(bt.week_start_date) INTO template_week_to_use
      FROM public.box_templates bt
      WHERE bt.week_start_date <= week_start 
        AND bt.box_size = box_size_name
        AND bt.is_confirmed = true;
      
      RAISE NOTICE '[POPULATE_BAG] Using fallback template from: %', template_week_to_use;
      
      IF template_week_to_use IS NOT NULL THEN
        FOR template_record IN
          SELECT bt.product_id, bt.quantity, p.price, p.category
          FROM public.box_templates bt
          JOIN public.products p ON p.id = bt.product_id
          WHERE bt.week_start_date = template_week_to_use 
            AND bt.box_size = box_size_name
            AND bt.is_confirmed = true
        LOOP
          IF template_record.category = 'addons' THEN
            item_type_to_use := 'addon';
          ELSE
            item_type_to_use := 'box_item';
          END IF;
          
          INSERT INTO public.weekly_bag_items (
            weekly_bag_id, product_id, quantity, price_at_time, item_type
          ) VALUES (
            bag_id, template_record.product_id, template_record.quantity, template_record.price, item_type_to_use
          );
          
          inserted_count := inserted_count + 1;
        END LOOP;
      END IF;
    END IF;
  END IF;
  
  RAISE NOTICE '[POPULATE_BAG] Completed - Total items inserted: %', inserted_count;
  
  -- Recalculate totals
  PERFORM update_weekly_bag_totals(bag_id);
  
  RAISE NOTICE '[POPULATE_BAG] Totals updated for bag_id: %', bag_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[POPULATE_BAG] ERROR: % - %', SQLERRM, SQLSTATE;
    RAISE;
END;
$function$;