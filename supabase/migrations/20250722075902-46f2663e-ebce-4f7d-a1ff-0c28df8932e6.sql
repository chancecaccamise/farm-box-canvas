
-- Enhance the orders table to include comprehensive delivery and routing information
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS billing_address_street TEXT,
ADD COLUMN IF NOT EXISTS billing_address_city TEXT,
ADD COLUMN IF NOT EXISTS billing_address_state TEXT,
ADD COLUMN IF NOT EXISTS billing_address_zip TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_street TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_apartment TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_state TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_zip TEXT,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS box_size TEXT,
ADD COLUMN IF NOT EXISTS box_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS addons_total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 4.99,
ADD COLUMN IF NOT EXISTS has_active_subscription BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS week_start_date DATE,
ADD COLUMN IF NOT EXISTS week_end_date DATE,
ADD COLUMN IF NOT EXISTS route_batch_id UUID REFERENCES public.route_batches(id),
ADD COLUMN IF NOT EXISTS assigned_driver_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS delivery_sequence INTEGER,
ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
ADD COLUMN IF NOT EXISTS proof_photo_url TEXT;

-- Update the order_items table to include more detailed product information
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'addon';

-- Create an index on delivery_date for grouping orders by delivery day
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders(delivery_date);

-- Create an index on route_batch_id for route optimization queries
CREATE INDEX IF NOT EXISTS idx_orders_route_batch_id ON public.orders(route_batch_id);

-- Create an index on assigned_driver_id for driver assignment queries
CREATE INDEX IF NOT EXISTS idx_orders_assigned_driver_id ON public.orders(assigned_driver_id);

-- Add RLS policies for the enhanced orders table to allow admin access
CREATE POLICY IF NOT EXISTS "Admins can manage all orders" ON public.orders
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "Admins can manage all order items" ON public.order_items
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable real-time for orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable real-time for order_items table
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- Create a function to get orders by delivery date for route optimization
CREATE OR REPLACE FUNCTION get_orders_by_delivery_date(delivery_date_param DATE)
RETURNS TABLE (
  order_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address_full TEXT,
  delivery_instructions TEXT,
  total_amount NUMERIC,
  order_items_summary TEXT,
  status TEXT,
  route_batch_id UUID,
  assigned_driver_id UUID,
  delivery_sequence INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id as order_id,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    CONCAT(o.shipping_address_street, 
           CASE WHEN o.shipping_address_apartment IS NOT NULL 
                THEN CONCAT(' ', o.shipping_address_apartment) 
                ELSE '' END,
           ', ', o.shipping_address_city, ', ', o.shipping_address_state, ' ', o.shipping_address_zip) as shipping_address_full,
    o.delivery_instructions,
    o.total_amount,
    STRING_AGG(CONCAT(oi.quantity, 'x ', COALESCE(oi.product_name, p.name)), ', ' ORDER BY oi.created_at) as order_items_summary,
    o.status,
    o.route_batch_id,
    o.assigned_driver_id,
    o.delivery_sequence
  FROM public.orders o
  LEFT JOIN public.order_items oi ON o.id = oi.order_id
  LEFT JOIN public.products p ON oi.product_id = p.id
  WHERE DATE(o.delivery_date) = delivery_date_param
  GROUP BY o.id, o.customer_name, o.customer_email, o.customer_phone, 
           o.shipping_address_street, o.shipping_address_apartment, o.shipping_address_city, 
           o.shipping_address_state, o.shipping_address_zip, o.delivery_instructions, 
           o.total_amount, o.status, o.route_batch_id, o.assigned_driver_id, o.delivery_sequence
  ORDER BY o.delivery_sequence NULLS LAST, o.created_at;
END;
$$;
