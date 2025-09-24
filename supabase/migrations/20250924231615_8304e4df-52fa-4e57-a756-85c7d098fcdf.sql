-- Create function to unconfirm a weekly bag
CREATE OR REPLACE FUNCTION public.unconfirm_weekly_bag(bag_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  bag_data RECORD;
  now_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current timestamp
  now_timestamp := now();
  
  -- Get bag data and verify ownership
  SELECT * INTO bag_data
  FROM public.weekly_bags
  WHERE id = bag_id
  AND user_id = auth.uid();
  
  -- Check if bag exists and user owns it
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bag not found or access denied';
  END IF;
  
  -- Check if cutoff time has passed
  IF now_timestamp > bag_data.cutoff_time THEN
    RAISE EXCEPTION 'Cannot unconfirm bag - cutoff time has passed';
  END IF;
  
  -- Check if bag is actually confirmed
  IF NOT bag_data.is_confirmed THEN
    RAISE EXCEPTION 'Bag is not confirmed';
  END IF;
  
  -- Unconfirm the bag
  UPDATE public.weekly_bags
  SET is_confirmed = false,
      confirmed_at = null,
      updated_at = now_timestamp
  WHERE id = bag_id;
  
  -- Re-populate bag from latest template to sync with admin changes
  PERFORM populate_weekly_bag_from_template(
    bag_id, 
    bag_data.box_size, 
    bag_data.week_start_date
  );
END;
$function$;