-- Fix template confirmation and bag population issues

-- 1. Update populate_weekly_bag_from_template to be more flexible
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
BEGIN
  -- Get box price
  SELECT base_price INTO box_price_amount
  FROM public.box_sizes
  WHERE name = box_size_name;
  
  -- Update weekly bag with box size and price
  UPDATE public.weekly_bags
  SET box_size = box_size_name,
      box_price = box_price_amount
  WHERE id = bag_id;
  
  -- Remove existing box items (keep add-ons)
  DELETE FROM public.weekly_bag_items
  WHERE weekly_bag_id = bag_id AND item_type = 'box_item';
  
  -- Check if current week has confirmed templates
  SELECT EXISTS(
    SELECT 1 FROM public.box_templates bt
    WHERE bt.week_start_date = week_start 
      AND bt.box_size = box_size_name
      AND bt.is_confirmed = true
  ) INTO has_confirmed_templates;
  
  -- Check if current week has any templates (confirmed or not)
  SELECT EXISTS(
    SELECT 1 FROM public.box_templates bt
    WHERE bt.week_start_date = week_start 
      AND bt.box_size = box_size_name
  ) INTO has_any_templates;
  
  -- Determine which templates to use
  IF has_confirmed_templates THEN
    -- Use confirmed templates for current week
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
        weekly_bag_id,
        product_id,
        quantity,
        price_at_time,
        item_type
      ) VALUES (
        bag_id,
        template_record.product_id,
        template_record.quantity,
        template_record.price,
        'box_item'
      );
    END LOOP;
    
  ELSIF has_any_templates THEN
    -- Use unconfirmed templates as preview for current week
    template_week_to_use := week_start;
    
    FOR template_record IN
      SELECT bt.product_id, bt.quantity, p.price
      FROM public.box_templates bt
      JOIN public.products p ON p.id = bt.product_id
      WHERE bt.week_start_date = template_week_to_use 
        AND bt.box_size = box_size_name
    LOOP
      INSERT INTO public.weekly_bag_items (
        weekly_bag_id,
        product_id,
        quantity,
        price_at_time,
        item_type
      ) VALUES (
        bag_id,
        template_record.product_id,
        template_record.quantity,
        template_record.price,
        'box_item'
      );
    END LOOP;
    
  ELSE
    -- Look for the most recent confirmed template to use as fallback
    SELECT MAX(bt.week_start_date) INTO template_week_to_use
    FROM public.box_templates bt
    WHERE bt.week_start_date <= week_start 
      AND bt.box_size = box_size_name
      AND bt.is_confirmed = true;
    
    -- If we found a fallback template, use it
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
          weekly_bag_id,
          product_id,
          quantity,
          price_at_time,
          item_type
        ) VALUES (
          bag_id,
          template_record.product_id,
          template_record.quantity,
          template_record.price,
          'box_item'
        );
      END LOOP;
    END IF;
  END IF;
  
  -- Recalculate totals
  PERFORM update_weekly_bag_totals(bag_id);
END;
$function$;

-- 2. Update the update_all_user_bags_for_template_change function to handle both confirmed and unconfirmed states
CREATE OR REPLACE FUNCTION public.update_all_user_bags_for_template_change(template_week_start date, template_box_size text, template_is_confirmed boolean)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  affected_bags_count INTEGER := 0;
  bag_record RECORD;
BEGIN
  -- Update all bags for this week/size that are not confirmed yet
  -- This includes both confirmed and unconfirmed bags so users see immediate changes
  FOR bag_record IN
    SELECT id, user_id
    FROM public.weekly_bags
    WHERE week_start_date = template_week_start
      AND box_size = template_box_size
      AND is_confirmed = false  -- Only update non-confirmed user bags
  LOOP
    -- Repopulate the bag from the template
    PERFORM populate_weekly_bag_from_template(
      bag_record.id, 
      template_box_size, 
      template_week_start
    );
    
    affected_bags_count := affected_bags_count + 1;
  END LOOP;
  
  RETURN affected_bags_count;
END;
$function$;

-- 3. Create a trigger that fires on any template change (not just confirmation changes)
CREATE OR REPLACE FUNCTION public.handle_box_template_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Handle all changes to templates (inserts, updates, deletes)
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update all affected user bags when template is added or changed
    SELECT update_all_user_bags_for_template_change(
      NEW.week_start_date,
      NEW.box_size,
      NEW.is_confirmed
    ) INTO affected_count;
    
    -- Log the change for admin visibility (only for confirmation status changes)
    IF TG_OP = 'UPDATE' AND OLD.is_confirmed IS DISTINCT FROM NEW.is_confirmed THEN
      INSERT INTO public.box_template_change_log (
        template_id,
        week_start_date,
        box_size,
        old_confirmed_status,
        new_confirmed_status,
        affected_bags_count,
        changed_by,
        changed_at
      ) VALUES (
        NEW.id,
        NEW.week_start_date,
        NEW.box_size,
        OLD.is_confirmed,
        NEW.is_confirmed,
        affected_count,
        auth.uid(),
        now()
      );
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update all affected user bags when template is deleted
    SELECT update_all_user_bags_for_template_change(
      OLD.week_start_date,
      OLD.box_size,
      false
    ) INTO affected_count;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- 4. Drop the old trigger and create the new one
DROP TRIGGER IF EXISTS box_template_confirmation_change_trigger ON public.box_templates;

CREATE TRIGGER box_template_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.box_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_box_template_change();