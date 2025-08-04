-- Add checkout tracking field to weekly_bag_items
ALTER TABLE public.weekly_bag_items 
ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT false;

-- Add comment to explain the field
COMMENT ON COLUMN public.weekly_bag_items.is_paid IS 'Tracks whether this add-on item has been checked out and paid for. Box items are always false since they are included in subscription.';