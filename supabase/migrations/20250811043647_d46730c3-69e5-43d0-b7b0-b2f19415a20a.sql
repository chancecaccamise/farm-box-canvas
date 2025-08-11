-- Drop the existing unique constraint that prevents same product as addon and box_item
ALTER TABLE public.weekly_bag_items 
DROP CONSTRAINT IF EXISTS weekly_bag_items_weekly_bag_id_product_id_key;

-- Add new unique constraint that includes item_type
-- This allows same product to exist as both addon and box_item
ALTER TABLE public.weekly_bag_items 
ADD CONSTRAINT weekly_bag_items_weekly_bag_id_product_id_item_type_key 
UNIQUE (weekly_bag_id, product_id, item_type);