-- Update cron job to run at Sunday 12:00 AM EST (Sunday 5:00 AM UTC)
-- This aligns with when the lockout period ends, so new orders are ready immediately

-- First unschedule the existing job
SELECT cron.unschedule('generate-weekly-orders-job');

-- Create new job with updated timing
SELECT cron.schedule(
  'generate-weekly-orders-job',
  '0 5 * * 0',  -- Sunday 5:00 AM UTC = Sunday 12:00 AM EST
  $$
  SELECT net.http_post(
    url := 'https://umfjwvucdqmzufczisca.supabase.co/functions/v1/generate-weekly-orders',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);