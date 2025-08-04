-- Update the populate_weekly_bag_from_template function to only use confirmed templates
CREATE OR REPLACE FUNCTION public.populate_weekly_bag_from_template(bag_id uuid, box_size_name text, week_start date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  template_record RECORD;
  box_price_amount DECIMAL(10,2);
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
  
  -- Insert box template items - ONLY if they are confirmed
  FOR template_record IN
    SELECT bt.product_id, bt.quantity, p.price
    FROM public.box_templates bt
    JOIN public.products p ON p.id = bt.product_id
    WHERE bt.week_start_date = week_start 
      AND bt.box_size = box_size_name
      AND bt.is_confirmed = true  -- Only confirmed templates
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
  
  -- Recalculate totals
  PERFORM update_weekly_bag_totals(bag_id);
END;
$function$