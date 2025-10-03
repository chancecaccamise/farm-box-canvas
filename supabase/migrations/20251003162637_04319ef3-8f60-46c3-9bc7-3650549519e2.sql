-- Update Full Billy's Bag (full_farm_bag) with new item count and description
UPDATE public.box_sizes
SET 
  item_count_range = '7 items',
  description = '1 protein chosen by customer, 1 carb chosen by customer, and 5 items handpicked weekly by Billy and Ana, value of $50 or more',
  updated_at = now()
WHERE name = 'full_farm_bag';

-- Update Veggie Billy's Bag (veggie_bag) with new description
UPDATE public.box_sizes
SET 
  description = '6 items handpicked weekly by Billy and Ana, value of $30 or more',
  updated_at = now()
WHERE name = 'veggie_bag';

-- Update Protein Billy's Bag (protein-pack) with new description
UPDATE public.box_sizes
SET 
  description = '5 proteins selected by the customer, value of $100 or more',
  updated_at = now()
WHERE name = 'protein-pack';