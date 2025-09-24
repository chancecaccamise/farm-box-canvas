-- Add new fields to orders table for enhanced order management
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_day_preference text,
ADD COLUMN IF NOT EXISTS delivery_time_preference text,
ADD COLUMN IF NOT EXISTS customer_notes text,
ADD COLUMN IF NOT EXISTS user_protein_selections text[],
ADD COLUMN IF NOT EXISTS user_carb_selections text[],
ADD COLUMN IF NOT EXISTS user_full_farm_bag_protein text,
ADD COLUMN IF NOT EXISTS user_full_farm_bag_carb text;