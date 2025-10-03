-- Fix order_items to display correct box names (e.g., "Full Billy's Bag" instead of "full_farm_bag Farm Box")
-- This updates all existing orders with the proper display names from the box_sizes table

-- Update all order_items with correct box display names
UPDATE order_items oi
SET product_name = bs.display_name
FROM orders o
JOIN box_sizes bs ON o.box_size = bs.name
WHERE oi.order_id = o.id
  AND oi.item_type = 'box'
  AND oi.product_name LIKE '%Farm Box%';

-- Log the changes
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % order items with correct display names', updated_count;
END $$;