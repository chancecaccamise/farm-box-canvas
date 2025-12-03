-- Update cutoff time function to Friday 12 PM (noon) EST instead of Thursday 5 PM
CREATE OR REPLACE FUNCTION public.get_next_cutoff_time(input_date date DEFAULT CURRENT_DATE)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
AS $function$
DECLARE
  next_friday DATE;
  cutoff_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Find next Friday (day of week 5, where Sunday = 0)
  next_friday := input_date + (5 - EXTRACT(DOW FROM input_date)::INTEGER + 7) % 7;
  
  -- If today is Friday and it's before 12 PM EST, use this Friday
  IF EXTRACT(DOW FROM input_date) = 5 AND 
     EXTRACT(HOUR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')) < 12 THEN
    next_friday := input_date;
  END IF;
  
  -- Set cutoff time to Friday 12 PM (noon) EST (convert to UTC for storage)
  cutoff_time := (next_friday::TEXT || ' 12:00:00 America/New_York')::TIMESTAMP WITH TIME ZONE;
  
  RETURN cutoff_time;
END;
$function$;