-- Create weekly_bags table to track weekly selections with cutoff functionality
CREATE TABLE public.weekly_bags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  cutoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  subtotal DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 4.99,
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Create weekly_bag_items table to track items in each weekly bag
CREATE TABLE public.weekly_bag_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_bag_id UUID NOT NULL REFERENCES public.weekly_bags(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(weekly_bag_id, product_id)
);

-- Enable RLS
ALTER TABLE public.weekly_bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_bag_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekly_bags
CREATE POLICY "Users can view their own weekly bags" ON public.weekly_bags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly bags" ON public.weekly_bags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly bags" ON public.weekly_bags
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for weekly_bag_items
CREATE POLICY "Users can view their own weekly bag items" ON public.weekly_bag_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.weekly_bags 
      WHERE weekly_bags.id = weekly_bag_items.weekly_bag_id 
      AND weekly_bags.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own weekly bag items" ON public.weekly_bag_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.weekly_bags 
      WHERE weekly_bags.id = weekly_bag_items.weekly_bag_id 
      AND weekly_bags.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own weekly bag items" ON public.weekly_bag_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.weekly_bags 
      WHERE weekly_bags.id = weekly_bag_items.weekly_bag_id 
      AND weekly_bags.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own weekly bag items" ON public.weekly_bag_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.weekly_bags 
      WHERE weekly_bags.id = weekly_bag_items.weekly_bag_id 
      AND weekly_bags.user_id = auth.uid()
    )
  );

-- Add triggers for updated_at columns
CREATE TRIGGER update_weekly_bags_updated_at
  BEFORE UPDATE ON public.weekly_bags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_bag_items_updated_at
  BEFORE UPDATE ON public.weekly_bag_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate next Thursday 5 PM EST cutoff
CREATE OR REPLACE FUNCTION get_next_cutoff_time(input_date DATE DEFAULT CURRENT_DATE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  next_thursday DATE;
  cutoff_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Find next Thursday
  next_thursday := input_date + (4 - EXTRACT(DOW FROM input_date)::INTEGER + 7) % 7;
  
  -- If today is Thursday and it's before 5 PM EST, use this Thursday
  IF EXTRACT(DOW FROM input_date) = 4 AND 
     CURRENT_TIME AT TIME ZONE 'EST' < '17:00:00' THEN
    next_thursday := input_date;
  END IF;
  
  -- Set cutoff time to Thursday 5 PM EST
  cutoff_time := next_thursday + INTERVAL '17 hours' AT TIME ZONE 'EST';
  
  RETURN cutoff_time;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create current week bag
CREATE OR REPLACE FUNCTION get_or_create_current_week_bag(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  current_week_start DATE;
  current_week_end DATE;
  cutoff_time TIMESTAMP WITH TIME ZONE;
  bag_id UUID;
BEGIN
  -- Calculate current week (Monday to Sunday)
  current_week_start := DATE_TRUNC('week', CURRENT_DATE);
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
$$ LANGUAGE plpgsql SECURITY DEFINER;