-- Make product_id nullable in order_items table to allow box items without product IDs
ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;