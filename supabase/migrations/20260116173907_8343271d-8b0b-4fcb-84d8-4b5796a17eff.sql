-- Link orphaned orders to their matching weekly_bags
UPDATE orders o
SET weekly_bag_id = wb.id
FROM weekly_bags wb
WHERE o.user_id = wb.user_id
  AND o.week_start_date = wb.week_start_date
  AND o.weekly_bag_id IS NULL;