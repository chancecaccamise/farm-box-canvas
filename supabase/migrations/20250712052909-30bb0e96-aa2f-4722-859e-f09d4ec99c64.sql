-- Fix the timezone function syntax error
DROP FUNCTION IF EXISTS get_next_cutoff_time(DATE);

CREATE OR REPLACE FUNCTION get_next_cutoff_time(input_date DATE DEFAULT CURRENT_DATE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  next_thursday DATE;
  cutoff_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Find next Thursday (day of week 4, where Sunday = 0)
  next_thursday := input_date + (4 - EXTRACT(DOW FROM input_date)::INTEGER + 7) % 7;
  
  -- If today is Thursday and it's before 5 PM EST, use this Thursday
  IF EXTRACT(DOW FROM input_date) = 4 AND 
     EXTRACT(HOUR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'EST')) < 17 THEN
    next_thursday := input_date;
  END IF;
  
  -- Set cutoff time to Thursday 5 PM EST (convert to UTC for storage)
  cutoff_time := (next_thursday::TEXT || ' 17:00:00-05')::TIMESTAMP WITH TIME ZONE;
  
  RETURN cutoff_time;
END;
$$ LANGUAGE plpgsql;