-- Add indexes for better performance on order queries
CREATE INDEX IF NOT EXISTS idx_orders_weekly_bag_id ON public.orders(weekly_bag_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_week ON public.orders(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);

-- Add function to consolidate orders for the same week/user
CREATE OR REPLACE FUNCTION public.get_or_create_weekly_order(
  p_user_id UUID,
  p_weekly_bag_id UUID,
  p_week_start_date DATE,
  p_week_end_date DATE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_order_id UUID;
  new_order_id UUID;
BEGIN
  -- Try to find existing order for this week and user
  SELECT id INTO existing_order_id
  FROM public.orders
  WHERE user_id = p_user_id 
    AND weekly_bag_id = p_weekly_bag_id
    AND payment_status = 'pending'
    AND week_start_date = p_week_start_date
  LIMIT 1;
  
  -- If found, return existing order
  IF existing_order_id IS NOT NULL THEN
    RETURN existing_order_id;
  END IF;
  
  -- Otherwise, this will be handled by create-payment function
  -- Return NULL to indicate no existing order found
  RETURN NULL;
END;
$$;