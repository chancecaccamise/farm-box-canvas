-- Function to cleanup stale pending orders (older than 24 hours)
-- This prevents abandoned checkout orders from persisting indefinitely
CREATE OR REPLACE FUNCTION public.cleanup_stale_pending_orders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  UPDATE orders
  SET payment_status = 'cancelled',
      status = 'cancelled',
      updated_at = NOW()
  WHERE payment_status = 'pending'
    AND created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN cleaned_count;
END;
$$;