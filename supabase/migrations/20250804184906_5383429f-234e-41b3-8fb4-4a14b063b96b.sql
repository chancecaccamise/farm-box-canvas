-- Function to update all user bags when a box template is confirmed/unconfirmed
CREATE OR REPLACE FUNCTION update_all_user_bags_for_template_change(
  template_week_start DATE,
  template_box_size TEXT,
  template_is_confirmed BOOLEAN
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_bags_count INTEGER := 0;
  bag_record RECORD;
BEGIN
  -- Only update bags that are not confirmed yet (preserve locked bags)
  FOR bag_record IN
    SELECT id, user_id
    FROM public.weekly_bags
    WHERE week_start_date = template_week_start
      AND box_size = template_box_size
      AND is_confirmed = false
  LOOP
    -- Repopulate the bag from the template
    PERFORM populate_weekly_bag_from_template(
      bag_record.id, 
      template_box_size, 
      template_week_start
    );
    
    affected_bags_count := affected_bags_count + 1;
  END LOOP;
  
  RETURN affected_bags_count;
END;
$$;

-- Function to handle box template confirmation changes
CREATE OR REPLACE FUNCTION handle_box_template_confirmation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Only trigger when is_confirmed status changes
  IF OLD.is_confirmed IS DISTINCT FROM NEW.is_confirmed THEN
    -- Update all affected user bags
    SELECT update_all_user_bags_for_template_change(
      NEW.week_start_date,
      NEW.box_size,
      NEW.is_confirmed
    ) INTO affected_count;
    
    -- Log the change for admin visibility
    INSERT INTO public.box_template_change_log (
      template_id,
      week_start_date,
      box_size,
      old_confirmed_status,
      new_confirmed_status,
      affected_bags_count,
      changed_by,
      changed_at
    ) VALUES (
      NEW.id,
      NEW.week_start_date,
      NEW.box_size,
      OLD.is_confirmed,
      NEW.is_confirmed,
      affected_count,
      auth.uid(),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create log table for template changes
CREATE TABLE IF NOT EXISTS public.box_template_change_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  box_size TEXT NOT NULL,
  old_confirmed_status BOOLEAN NOT NULL,
  new_confirmed_status BOOLEAN NOT NULL,
  affected_bags_count INTEGER NOT NULL DEFAULT 0,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the log table
ALTER TABLE public.box_template_change_log ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view the log
CREATE POLICY "Admins can view template change log"
ON public.box_template_change_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create the trigger
CREATE TRIGGER box_template_confirmation_trigger
  AFTER UPDATE ON public.box_templates
  FOR EACH ROW
  EXECUTE FUNCTION handle_box_template_confirmation_change();

-- Enable realtime for weekly_bag_items so users see updates
ALTER TABLE public.weekly_bag_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_bag_items;