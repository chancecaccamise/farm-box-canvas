-- Add Stripe subscription tracking to user_subscriptions table
ALTER TABLE public.user_subscriptions 
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN stripe_customer_id TEXT;