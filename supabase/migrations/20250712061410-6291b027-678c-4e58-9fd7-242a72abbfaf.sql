-- First, create the new enum type
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'suspended');

-- Add new columns for subscription management first
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pause_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS auto_resume_date DATE;

-- Add a new column with the enum type
ALTER TABLE public.user_subscriptions 
ADD COLUMN new_status subscription_status DEFAULT 'active';

-- Update the new column based on existing status values
UPDATE public.user_subscriptions 
SET new_status = CASE 
  WHEN status = 'active' THEN 'active'::subscription_status
  ELSE 'active'::subscription_status
END;

-- Drop the old column and rename the new one
ALTER TABLE public.user_subscriptions 
DROP COLUMN status,
RENAME COLUMN new_status TO status;

-- Set the column as NOT NULL
ALTER TABLE public.user_subscriptions 
ALTER COLUMN status SET NOT NULL;