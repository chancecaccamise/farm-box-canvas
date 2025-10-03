-- Fix add-ons display by updating populate_weekly_bag_from_template function
-- to properly categorize items based on product category

-- First, fix existing weekly_bag_items that are incorrectly categorized
UPDATE public.weekly_bag_items
SET item_type = 'addon'
WHERE item_type = 'box_item'
  AND product_id IN (
    SELECT id FROM public.products WHERE category = 'addons'
  );

-- Drop and recreate the populate_weekly_bag_from_template function
DROP FUNCTION IF EXISTS public.populate_weekly_bag_from_template(uuid, text, date);

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
  
  -- Remove ALL existing items (box items, user selections, and add-ons to be safe)
  DELETE FROM public.weekly_bag_items
  WHERE weekly_bag_id = bag_id;

  -- Handle different box types
  IF box_size_name = 'full_farm_bag' THEN
    -- Full Farm Bag: Add user-selected protein and carb FIRST, then ALL template items
    
    -- Add user-selected protein if exists
    IF bag_data.user_full_farm_bag_protein IS NOT NULL THEN
      INSERT INTO public.weekly_bag_items (
        weekly_bag_id, product_id, quantity, price_at_time, item_type
      )
      SELECT bag_id, bag_data.user_full_farm_bag_protein::uuid, 1, p.price, 'user_selected_protein'
      FROM public.products p
      WHERE p.id = bag_data.user_full_farm_bag_protein::uuid;
    END IF;

    -- Add user-selected carb if exists  
    IF bag_data.user_full_farm_bag_carb IS NOT NULL THEN
      INSERT INTO public.weekly_bag_items (
        weekly_bag_id, product_id, quantity, price_at_time, item_type
      )
      SELECT bag_id, bag_data.user_full_farm_bag_carb::uuid, 1, p.price, 'user_selected_carb'
      FROM public.products p
      WHERE p.id = bag_data.user_full_farm_bag_carb::uuid;
    END IF;

    -- Find the template to use
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
        SELECT bt.product_id, bt.quantity, p.price, p.category
        FROM public.box_templates bt
        JOIN public.products p ON p.id = bt.product_id
        WHERE bt.week_start_date = template_week_to_use 
          AND bt.box_size = box_size_name
          AND bt.is_confirmed = true
          AND bt.product_id NOT IN (
            SELECT unnest(ARRAY[
              COALESCE(bag_data.user_full_farm_bag_protein::uuid, '00000000-0000-0000-0000-000000000000'::uuid),
              COALESCE(bag_data.user_full_farm_bag_carb::uuid, '00000000-0000-0000-0000-000000000000'::uuid)
            ])
          )
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
      END LOOP;
    END IF;

  ELSIF box_size_name = 'protein-pack' THEN
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
    END IF;

  ELSE
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
    
    IF has_confirmed_templates THEN
      template_week_to_use := week_start;
      
      FOR template_record IN
        SELECT bt.product_id, bt.quantity, p.price, p.category
        FROM public.box_templates bt
        JOIN public.products p ON p.id = bt.product_id
        WHERE bt.week_start_date = template_week_to_use 
          AND bt.box_size = box_size_name
          AND bt.is_confirmed = true
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
          SELECT bt.product_id, bt.quantity, p.price, p.category
          FROM public.box_templates bt
          JOIN public.products p ON p.id = bt.product_id
          WHERE bt.week_start_date = template_week_to_use 
            AND bt.box_size = box_size_name
            AND bt.is_confirmed = true
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
        END LOOP;
      END IF;
    END IF;
  END IF;
  
  -- Recalculate totals
  PERFORM update_weekly_bag_totals(bag_id);
END;
$function$;