-- Migration to implement Ana's updated farm bag system
-- Handle foreign key constraints properly

-- 1. First, let's add new columns to the products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS market_price_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_complimentary BOOLEAN DEFAULT FALSE;

-- 2. Add new columns to box_templates for enhanced functionality
ALTER TABLE public.box_templates ADD COLUMN IF NOT EXISTS customer_choice BOOLEAN DEFAULT FALSE;
ALTER TABLE public.box_templates ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'standard';
ALTER TABLE public.box_templates ADD COLUMN IF NOT EXISTS price_override NUMERIC;

-- 3. Add support for subscriber vs non-subscriber pricing in box_sizes
ALTER TABLE public.box_sizes ADD COLUMN IF NOT EXISTS subscriber_price NUMERIC;

-- 4. Create user_bag_selections table for multi-bag support
CREATE TABLE IF NOT EXISTS public.user_bag_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  box_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date, box_type)
);

-- Enable RLS on user_bag_selections
ALTER TABLE public.user_bag_selections ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_bag_selections
CREATE POLICY "Users can view their own bag selections" 
ON public.user_bag_selections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bag selections" 
ON public.user_bag_selections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bag selections" 
ON public.user_bag_selections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bag selections" 
ON public.user_bag_selections 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Handle existing box_templates - migrate them to new box types
-- Update existing box_templates to use new box types (temporary mapping)
UPDATE public.box_templates SET box_size = 'veggie_bag' WHERE box_size = 'small';
UPDATE public.box_templates SET box_size = 'full_farm_bag' WHERE box_size = 'medium';  
UPDATE public.box_templates SET box_size = 'protein_pack' WHERE box_size = 'large';

-- 6. Update existing box_sizes to Ana's new structure
-- Update existing records instead of deleting
UPDATE public.box_sizes SET 
  name = 'veggie_bag',
  display_name = 'Small Veggie Bag',
  base_price = 30.00,
  subscriber_price = 25.00,
  description = 'Perfect vegetable selection for conscious eaters',
  serves_text = '1-2 people',
  item_count_range = '6 items'
WHERE name = 'small';

UPDATE public.box_sizes SET 
  name = 'full_farm_bag',
  display_name = 'Full Farm Bag',
  base_price = 55.00,
  subscriber_price = 50.00,
  description = 'Complete farm experience with vegetables, proteins, and pantry goods',
  serves_text = '2-4 people',
  item_count_range = '8 items + 1 complimentary gift'
WHERE name = 'medium';

UPDATE public.box_sizes SET 
  name = 'protein_pack',
  display_name = 'Seafood/Protein Pack',
  base_price = 100.00,
  subscriber_price = 95.00,
  description = 'Premium selection of proteins and seafood',
  serves_text = '4+ people',
  item_count_range = '5 customer-selected proteins'
WHERE name = 'large';

-- 7. Add complimentary gift products
INSERT INTO public.products (name, category, price, description, is_available, inventory_count, is_complimentary, tags) VALUES
('Farm Herb Butter', 'pantry', 0.00, 'Handcrafted herb butter made with fresh farm herbs', true, 1000, true, ARRAY['complimentary', 'handcrafted', 'herbs']),
('Herb Salt', 'pantry', 0.00, 'Artisanal salt blend with dried farm herbs', true, 1000, true, ARRAY['complimentary', 'artisanal', 'herbs']),
('Edible Flowers', 'pantry', 0.00, 'Beautiful edible flowers for garnishing and cooking', true, 1000, true, ARRAY['complimentary', 'edible', 'flowers']),
('Extra Herbs', 'addons', 0.00, 'Seasonal selection of fresh herbs from the farm', true, 1000, true, ARRAY['complimentary', 'fresh', 'seasonal']);

-- 8. Update existing products categories to match Ana's structure
UPDATE public.products SET category = 'vegetables' WHERE category IN ('vegetables');
UPDATE public.products SET category = 'proteins' WHERE category IN ('meat', 'fish');
UPDATE public.products SET category = 'pantry' WHERE category IN ('dairy', 'other', 'Bakery');
UPDATE public.products SET category = 'addons' WHERE category IN ('herbs') AND is_complimentary = false;

-- 9. Add some sample unit descriptions and weights to existing products
UPDATE public.products SET 
  unit_description = '2 lbs',
  weight = 2.0
WHERE name = 'Organic Heirloom Tomatoes';

UPDATE public.products SET 
  unit_description = '1 lb bunch',
  weight = 1.0
WHERE name = 'Fresh Rainbow Carrots';

UPDATE public.products SET 
  unit_description = '1 lb fillet',
  weight = 1.0
WHERE name = 'Atlantic Salmon Fillet';

UPDATE public.products SET 
  unit_description = '1 lb package',
  weight = 1.0
WHERE name = 'Grass-Fed Ground Beef';

UPDATE public.products SET 
  unit_description = '1 dozen',
  weight = 1.5
WHERE name = 'Farm Fresh Eggs';

UPDATE public.products SET 
  unit_description = '1 loaf',
  weight = 1.5
WHERE name = 'Artisan Sourdough Bread';

-- 10. Add trigger for updated_at on user_bag_selections
CREATE TRIGGER update_user_bag_selections_updated_at
  BEFORE UPDATE ON public.user_bag_selections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Add constraint to item_type column on box_templates
ALTER TABLE public.box_templates 
ADD CONSTRAINT check_item_type 
CHECK (item_type IN ('standard', 'complimentary', 'customer_choice'));