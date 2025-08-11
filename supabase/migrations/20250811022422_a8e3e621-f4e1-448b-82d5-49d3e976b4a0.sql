-- Add unique constraint to prevent multiple active orders per user
-- First, let's add a status column to orders if it doesn't exist properly
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_confirmation_number TEXT;

-- Create a unique constraint to prevent multiple paid orders per user
-- We'll allow only one paid order per user at a time
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_paid_order_per_user 
ON public.orders (user_id) 
WHERE payment_status = 'paid';

-- Add a function to generate order confirmation numbers
CREATE OR REPLACE FUNCTION generate_order_confirmation_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BB' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-generate confirmation numbers
CREATE OR REPLACE FUNCTION set_order_confirmation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_confirmation_number IS NULL THEN
    NEW.order_confirmation_number = generate_order_confirmation_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_order_confirmation_number ON public.orders;
CREATE TRIGGER trigger_set_order_confirmation_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_confirmation_number();