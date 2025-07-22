
-- Enhance the orders table to include Stripe payment tracking and customer information
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
ADD COLUMN IF NOT EXISTS week_end_date DATE;

-- Update the order_items table to include more detailed product information
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'addon';

-- Create an index on stripe_session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON public.orders(stripe_session_id);

-- Create an index on payment_status for export queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- Create an index on order_date for weekly exports
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date);

-- Add RLS policies for the enhanced orders table
CREATE POLICY IF NOT EXISTS "Service role can manage all orders" ON public.orders
FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Service role can manage all order items" ON public.order_items
FOR ALL USING (true);
