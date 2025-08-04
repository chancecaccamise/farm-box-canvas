-- Clean up inconsistent subscription data
-- Set proper status for subscriptions that have cancellation dates but are still marked as active
UPDATE public.user_subscriptions 
SET status = 'cancelled'::subscription_status
WHERE cancelled_at IS NOT NULL 
  AND status = 'active'::subscription_status;

-- For users with multiple active subscriptions, keep only the most recent one
WITH ranked_subscriptions AS (
  SELECT 
    id,
    user_id,
    status,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as row_num
  FROM public.user_subscriptions
  WHERE status = 'active'::subscription_status
),
subscriptions_to_cancel AS (
  SELECT id 
  FROM ranked_subscriptions 
  WHERE row_num > 1
)
UPDATE public.user_subscriptions 
SET status = 'cancelled'::subscription_status,
    cancelled_at = now(),
    cancellation_reason = 'Automatically cancelled to resolve duplicate active subscriptions'
WHERE id IN (SELECT id FROM subscriptions_to_cancel);