-- Update weekly bag totals function to set delivery fee to $9.00
CREATE OR REPLACE FUNCTION public.update_weekly_bag_totals(bag_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  box_price_amount DECIMAL(10,2) := 0;
  addons_amount DECIMAL(10,2) := 0;
  delivery_fee_amount DECIMAL(10,2) := 9.00; -- Updated to $9.00
BEGIN
  -- Get box price
  SELECT COALESCE(box_price, 0) INTO box_price_amount
  FROM public.weekly_bags
  WHERE id = bag_id;
  
  -- Calculate add-ons total
  SELECT COALESCE(SUM(quantity * price_at_time), 0) INTO addons_amount
  FROM public.weekly_bag_items
  WHERE weekly_bag_id = bag_id AND item_type = 'addon';
  
  -- Update totals with $9.00 delivery fee
  UPDATE public.weekly_bags
  SET subtotal = box_price_amount + addons_amount,
      addons_total = addons_amount,
      delivery_fee = delivery_fee_amount,
      total_amount = box_price_amount + addons_amount + delivery_fee_amount
  WHERE id = bag_id;
END;
$function$;

-- Update existing weekly_bags to have $9.00 delivery fee and recalculate totals
UPDATE public.weekly_bags 
SET delivery_fee = 9.00,
    total_amount = COALESCE(subtotal, 0) + 9.00;

-- Update existing orders to have $9.00 delivery fee and recalculate totals
UPDATE public.orders 
SET delivery_fee = 9.00,
    total_amount = COALESCE(box_price, 0) + COALESCE(addons_total, 0) + 9.00;