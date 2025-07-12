-- Update user_subscriptions table to support pause/cancel functionality
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;

-- Create new enum with additional status values
DROP TYPE IF EXISTS subscription_status CASCADE;
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'suspended');

-- Add new columns for subscription management
ALTER TABLE public.user_subscriptions 
ALTER COLUMN status TYPE subscription_status USING status::subscription_status,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pause_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS auto_resume_date DATE;

-- Update existing active subscriptions to use new enum
UPDATE public.user_subscriptions 
SET status = 'active'::subscription_status 
WHERE status IS NULL;