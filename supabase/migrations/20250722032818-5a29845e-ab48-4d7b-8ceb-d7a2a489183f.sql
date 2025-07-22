
-- Create box sizes table to define available box sizes and their pricing
CREATE TABLE public.box_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'small', 'medium', 'large'
  display_name TEXT NOT NULL, -- 'Small Box', 'Medium Box', 'Large Box'
  description TEXT,
  item_count_range TEXT, -- '8-10 items', '12-15 items', etc.
  base_price DECIMAL(10,2) NOT NULL,
  serves_text TEXT, -- 'Perfect for 1-2 people'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name)
);

-- Create box templates table to define what products go in each box size each week
CREATE TABLE public.box_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  box_size TEXT NOT NULL REFERENCES public.box_sizes(name),
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(week_start_date, box_size, product_id)
);

-- Add box_size column to weekly_bags and modify structure
ALTER TABLE public.weekly_bags 
ADD COLUMN box_size TEXT REFERENCES public.box_sizes(name),
ADD COLUMN box_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN addons_total DECIMAL(10,2) DEFAULT 0;

-- Add item_type to weekly_bag_items to distinguish between box items and add-ons
ALTER TABLE public.weekly_bag_items 
ADD COLUMN item_type TEXT NOT NULL DEFAULT 'box_item' CHECK (item_type IN ('box_item', 'addon'));

-- Insert default box sizes
INSERT INTO public.box_sizes (name, display_name, description, item_count_range, base_price, serves_text) VALUES
('small', 'Small Box', 'Perfect for 1-2 people', '8-10 items', 24.99, 'Perfect for 1-2 people'),
('medium', 'Medium Box', 'Great for 2-4 people', '12-15 items', 34.99, 'Great for 2-4 people'),
('large', 'Large Box', 'Ideal for 4+ people', '18-22 items', 44.99, 'Ideal for 4+ people');

-- Enable RLS on new tables
ALTER TABLE public.box_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for box_sizes (readable by everyone)
CREATE POLICY "Box sizes are viewable by everyone" ON public.box_sizes
  FOR SELECT USING (true);

-- RLS policies for box_templates (readable by everyone, manageable by admins)
CREATE POLICY "Box templates are viewable by everyone" ON public.box_templates
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage box templates" ON public.box_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at columns
CREATE TRIGGER update_box_sizes_updated_at
  BEFORE UPDATE ON public.box_sizes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_box_templates_updated_at
  BEFORE UPDATE ON public.box_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to populate weekly bag with box template items
CREATE OR REPLACE FUNCTION populate_weekly_bag_from_template(
  bag_id UUID,
  box_size_name TEXT,
  week_start DATE
)
RETURNS VOID AS $$
DECLARE
  template_record RECORD;
  box_price_amount DECIMAL(10,2);
BEGIN
  -- Get box price
  SELECT base_price INTO box_price_amount
  FROM public.box_sizes
  WHERE name = box_size_name;
  
  -- Update weekly bag with box size and price
  UPDATE public.weekly_bags
  SET box_size = box_size_name,
      box_price = box_price_amount
  WHERE id = bag_id;
  
  -- Remove existing box items (keep add-ons)
  DELETE FROM public.weekly_bag_items
  WHERE weekly_bag_id = bag_id AND item_type = 'box_item';
  
  -- Insert box template items
  FOR template_record IN
    SELECT bt.product_id, bt.quantity, p.price
    FROM public.box_templates bt
    JOIN public.products p ON p.id = bt.product_id
    WHERE bt.week_start_date = week_start AND bt.box_size = box_size_name
  LOOP
    INSERT INTO public.weekly_bag_items (
      weekly_bag_id,
      product_id,
      quantity,
      price_at_time,
      item_type
    ) VALUES (
      bag_id,
      template_record.product_id,
      template_record.quantity,
      template_record.price,
      'box_item'
    );
  END LOOP;
  
  -- Recalculate totals
  PERFORM update_weekly_bag_totals(bag_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update weekly bag totals
CREATE OR REPLACE FUNCTION update_weekly_bag_totals(bag_id UUID)
RETURNS VOID AS $$
DECLARE
  box_price_amount DECIMAL(10,2) := 0;
  addons_amount DECIMAL(10,2) := 0;
  delivery_fee_amount DECIMAL(10,2) := 4.99;
BEGIN
  -- Get box price
  SELECT COALESCE(box_price, 0) INTO box_price_amount
  FROM public.weekly_bags
  WHERE id = bag_id;
  
  -- Calculate add-ons total
  SELECT COALESCE(SUM(quantity * price_at_time), 0) INTO addons_amount
  FROM public.weekly_bag_items
  WHERE weekly_bag_id = bag_id AND item_type = 'addon';
  
  -- Update totals
  UPDATE public.weekly_bags
  SET subtotal = box_price_amount + addons_amount,
      addons_total = addons_amount,
      total_amount = box_price_amount + addons_amount + delivery_fee_amount
  WHERE id = bag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing get_or_create_current_week_bag function to handle box size
CREATE OR REPLACE FUNCTION get_or_create_current_week_bag_with_size(
  user_uuid UUID,
  box_size_name TEXT DEFAULT 'medium'
)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create some sample box templates for the current week
INSERT INTO public.box_templates (week_start_date, box_size, product_id, quantity)
SELECT 
  DATE_TRUNC('week', CURRENT_DATE) as week_start_date,
  'small' as box_size,
  p.id as product_id,
  1 as quantity
FROM public.products p 
WHERE p.category IN ('produce', 'herbs') 
AND p.is_available = true
LIMIT 8;

INSERT INTO public.box_templates (week_start_date, box_size, product_id, quantity)
SELECT 
  DATE_TRUNC('week', CURRENT_DATE) as week_start_date,
  'medium' as box_size,
  p.id as product_id,
  1 as quantity
FROM public.products p 
WHERE p.category IN ('produce', 'herbs', 'protein') 
AND p.is_available = true
LIMIT 12;

INSERT INTO public.box_templates (week_start_date, box_size, product_id, quantity)
SELECT 
  DATE_TRUNC('week', CURRENT_DATE) as week_start_date,
  'large' as box_size,
  p.id as product_id,
  1 as quantity
FROM public.products p 
WHERE p.is_available = true
LIMIT 18;
