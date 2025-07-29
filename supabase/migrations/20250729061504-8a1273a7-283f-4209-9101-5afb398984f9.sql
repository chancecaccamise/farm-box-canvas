-- Add missing columns to order_items table that create-payment edge function expects
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'product',
ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Update existing records to have proper item_type values
UPDATE public.order_items 
SET item_type = 'product' 
WHERE item_type IS NULL;