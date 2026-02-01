-- Update get_or_create_current_week_bag to handle Sunday properly
CREATE OR REPLACE FUNCTION public.get_or_create_current_week_bag(user_uuid uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_week_start DATE;
  current_week_end DATE;
  cutoff_time TIMESTAMP WITH TIME ZONE;
  bag_id UUID;
  today_in_est DATE;
  day_of_week INTEGER;
BEGIN
  -- Get today's date in EST
  today_in_est := (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::DATE;
  day_of_week := EXTRACT(DOW FROM today_in_est);
  
  -- Sunday (0) = Use next week's Monday; Other days = Use current week's Monday
  IF day_of_week = 0 THEN
    current_week_start := DATE_TRUNC('week', today_in_est) + INTERVAL '7 days';
  ELSE
    current_week_start := DATE_TRUNC('week', today_in_est);
  END IF;
  
  current_week_end := current_week_start + INTERVAL '6 days';
  cutoff_time := get_next_cutoff_time(current_week_start);
  
  -- Try to find existing bag for current week
  SELECT id INTO bag_id
  FROM public.weekly_bags
  WHERE user_id = user_uuid 
  AND week_start_date = current_week_start;
  
  -- If no bag exists, create one
  IF bag_id IS NULL THEN
    INSERT INTO public.weekly_bags (
      user_id, 
      week_start_date, 
      week_end_date, 
      cutoff_time
    ) VALUES (
      user_uuid, 
      current_week_start, 
      current_week_end, 
      cutoff_time
    ) RETURNING id INTO bag_id;
  END IF;
  
  RETURN bag_id;
END;
$function$;

-- Update get_or_create_current_week_bag_with_size to handle Sunday properly
CREATE OR REPLACE FUNCTION public.get_or_create_current_week_bag_with_size(user_uuid uuid, box_size_name text DEFAULT 'medium'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_week_start DATE;
  current_week_end DATE;
  cutoff_time TIMESTAMP WITH TIME ZONE;
  bag_id UUID;
  today_in_est DATE;
  day_of_week INTEGER;
BEGIN
  -- Get today's date in EST
  today_in_est := (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::DATE;
  day_of_week := EXTRACT(DOW FROM today_in_est);
  
  -- Sunday (0) = Use next week's Monday; Other days = Use current week's Monday
  IF day_of_week = 0 THEN
    current_week_start := DATE_TRUNC('week', today_in_est) + INTERVAL '7 days';
  ELSE
    current_week_start := DATE_TRUNC('week', today_in_est);
  END IF;
  
  current_week_end := current_week_start + INTERVAL '6 days';
  cutoff_time := get_next_cutoff_time(current_week_start);
  
  -- Try to find existing bag for current week
  SELECT id INTO bag_id
  FROM public.weekly_bags
  WHERE user_id = user_uuid 
  AND week_start_date = current_week_start;
  
  -- If no bag exists, create one
  IF bag_id IS NULL THEN
    INSERT INTO public.weekly_bags (
      user_id, 
      week_start_date, 
      week_end_date, 
      cutoff_time,
      box_size
    ) VALUES (
      user_uuid, 
      current_week_start, 
      current_week_end, 
      cutoff_time,
      box_size_name
    ) RETURNING id INTO bag_id;
    
    -- Populate with template items
    PERFORM populate_weekly_bag_from_template(bag_id, box_size_name, current_week_start);
  END IF;
  
  RETURN bag_id;
END;
$function$;