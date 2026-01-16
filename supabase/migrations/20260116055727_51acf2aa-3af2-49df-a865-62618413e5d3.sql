-- Enable required extensions (pg_cron and pg_net are available on Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the weekly order generation for every Sunday at 11:59 PM UTC
-- This ensures orders are created before the new week starts (Monday)
SELECT cron.schedule(
  'generate-weekly-orders-job',
  '59 23 * * 0', -- At 11:59 PM UTC every Sunday
  $$
  SELECT net.http_post(
    url := 'https://umfjwvucdqmzufczisca.supabase.co/functions/v1/generate-weekly-orders',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);