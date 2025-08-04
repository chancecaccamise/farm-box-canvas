-- Update the update_weekly_bag_totals function to remove delivery fee
CREATE OR REPLACE FUNCTION public.update_weekly_bag_totals(bag_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  box_price_amount DECIMAL(10,2) := 0;
  addons_amount DECIMAL(10,2) := 0;
  delivery_fee_amount DECIMAL(10,2) := 0; -- Set to 0 instead of 4.99
BEGIN
  -- Get box price
  SELECT COALESCE(box_price, 0) INTO box_price_amount
  FROM public.weekly_bags
  WHERE id = bag_id;
  
  -- Calculate add-ons total
  SELECT COALESCE(SUM(quantity * price_at_time), 0) INTO addons_amount
  FROM public.weekly_bag_items
  WHERE weekly_bag_id = bag_id AND item_type = 'addon';
  
  -- Update totals with zero delivery fee
  UPDATE public.weekly_bags
  SET subtotal = box_price_amount + addons_amount,
      addons_total = addons_amount,
      delivery_fee = delivery_fee_amount,
      total_amount = box_price_amount + addons_amount + delivery_fee_amount
  WHERE id = bag_id;
END;
$function$