-- Fix total_amount for subscription orders this week
-- Set total_amount = box_price + delivery_fee (excluding add-ons)
UPDATE orders
SET total_amount = COALESCE(box_price, 50) + COALESCE(delivery_fee, 0),
    addons_total = 0
WHERE week_start_date = '2026-01-12'
  AND order_type = 'subscription';