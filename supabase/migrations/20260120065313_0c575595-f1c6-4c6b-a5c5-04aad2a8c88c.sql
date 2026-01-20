-- Create missing orders for Brian Bailey (user_id: 2afdc973-318a-4fd7-bada-1ea042c406d9)
-- He is an active subscriber since Dec 21, 2025 but had no orders created due to webhook issue

INSERT INTO orders (
  user_id,
  customer_name,
  customer_email,
  customer_phone,
  shipping_address_street,
  shipping_address_city,
  shipping_address_state,
  shipping_address_zip,
  box_size,
  box_price,
  delivery_fee,
  total_amount,
  order_type,
  payment_status,
  status,
  week_start_date,
  week_end_date,
  delivery_day_preference,
  has_active_subscription,
  created_at
) VALUES 
  -- Week 1: Dec 22-28, 2025
  ('2afdc973-318a-4fd7-bada-1ea042c406d9', 'Brian Bailey', 'bmarcusbailey@gmail.com', '9127046937', '21 Deer Run', 'Savannah', 'GA', '31411', 'full_farm_bag', 55.00, 9.00, 64.00, 'subscription', 'paid', 'delivered', '2025-12-22', '2025-12-28', 'Saturday, Dec 27', true, '2025-12-21 17:35:34+00'),
  -- Week 2: Dec 29 - Jan 4, 2026
  ('2afdc973-318a-4fd7-bada-1ea042c406d9', 'Brian Bailey', 'bmarcusbailey@gmail.com', '9127046937', '21 Deer Run', 'Savannah', 'GA', '31411', 'full_farm_bag', 55.00, 9.00, 64.00, 'subscription', 'paid', 'delivered', '2025-12-29', '2026-01-04', 'Saturday, Jan 3', true, '2025-12-29 00:00:00+00'),
  -- Week 3: Jan 5-11, 2026
  ('2afdc973-318a-4fd7-bada-1ea042c406d9', 'Brian Bailey', 'bmarcusbailey@gmail.com', '9127046937', '21 Deer Run', 'Savannah', 'GA', '31411', 'full_farm_bag', 55.00, 9.00, 64.00, 'subscription', 'paid', 'delivered', '2026-01-05', '2026-01-11', 'Saturday, Jan 10', true, '2026-01-05 00:00:00+00'),
  -- Week 4: Jan 12-18, 2026
  ('2afdc973-318a-4fd7-bada-1ea042c406d9', 'Brian Bailey', 'bmarcusbailey@gmail.com', '9127046937', '21 Deer Run', 'Savannah', 'GA', '31411', 'full_farm_bag', 55.00, 9.00, 64.00, 'subscription', 'paid', 'delivered', '2026-01-12', '2026-01-18', 'Saturday, Jan 17', true, '2026-01-12 00:00:00+00'),
  -- Week 5: Jan 19-25, 2026 (current week - pending)
  ('2afdc973-318a-4fd7-bada-1ea042c406d9', 'Brian Bailey', 'bmarcusbailey@gmail.com', '9127046937', '21 Deer Run', 'Savannah', 'GA', '31411', 'full_farm_bag', 55.00, 9.00, 64.00, 'subscription', 'paid', 'pending', '2026-01-19', '2026-01-25', 'Saturday, Jan 24', true, NOW());