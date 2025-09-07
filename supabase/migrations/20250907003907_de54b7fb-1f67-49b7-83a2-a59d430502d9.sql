-- Migration to implement Ana's updated farm bag system
-- Handle foreign key constraints by updating box_sizes first

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

-- 5. Insert new box types first (keeping old ones for now)
INSERT INTO public.box_sizes (name, display_name, base_price, subscriber_price, description, serves_text, item_count_range, is_active) VALUES
('veggie_bag', 'Small Veggie Bag', 30.00, 25.00, 'Perfect vegetable selection for conscious eaters', '1-2 people', '6 items', true),
('full_farm_bag', 'Full Farm Bag', 55.00, 50.00, 'Complete farm experience with vegetables, proteins, and pantry goods', '2-4 people', '8 items + 1 complimentary gift', true),
('protein_pack', 'Seafood/Protein Pack', 100.00, 95.00, 'Premium selection of proteins and seafood', '4+ people', '5 customer-selected proteins', true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  base_price = EXCLUDED.base_price,
  subscriber_price = EXCLUDED.subscriber_price,
  description = EXCLUDED.description,
  serves_text = EXCLUDED.serves_text,
  item_count_range = EXCLUDED.item_count_range;

-- 6. Now migrate existing box_templates to use new box types
UPDATE public.box_templates SET box_size = 'veggie_bag' WHERE box_size = 'small';
UPDATE public.box_templates SET box_size = 'full_farm_bag' WHERE box_size = 'medium';  
UPDATE public.box_templates SET box_size = 'protein_pack' WHERE box_size = 'large';

-- 7. Now we can safely deactivate the old box sizes
UPDATE public.box_sizes SET is_active = false WHERE name IN ('small', 'medium', 'large');

-- 8. Add complimentary gift products
INSERT INTO public.products (name, category, price, description, is_available, inventory_count, is_complimentary, tags) VALUES
('Farm Herb Butter', 'pantry', 0.00, 'Handcrafted herb butter made with fresh farm herbs', true, 1000, true, ARRAY['complimentary', 'handcrafted', 'herbs']),
('Herb Salt', 'pantry', 0.00, 'Artisanal salt blend with dried farm herbs', true, 1000, true, ARRAY['complimentary', 'artisanal', 'herbs']),
('Edible Flowers', 'pantry', 0.00, 'Beautiful edible flowers for garnishing and cooking', true, 1000, true, ARRAY['complimentary', 'edible', 'flowers']),
('Extra Herbs', 'addons', 0.00, 'Seasonal selection of fresh herbs from the farm', true, 1000, true, ARRAY['complimentary', 'fresh', 'seasonal'])
ON CONFLICT (name) DO NOTHING;

-- 9. Update existing products categories to match Ana's structure
UPDATE public.products SET category = 'vegetables' WHERE category IN ('vegetables');
UPDATE public.products SET category = 'proteins' WHERE category IN ('meat', 'fish');
UPDATE public.products SET category = 'pantry' WHERE category IN ('dairy', 'other', 'Bakery');
UPDATE public.products SET category = 'addons' WHERE category IN ('herbs') AND is_complimentary = false;

-- 10. Add some sample unit descriptions and weights to existing products
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

-- 11. Add trigger for updated_at on user_bag_selections
CREATE TRIGGER update_user_bag_selections_updated_at
  BEFORE UPDATE ON public.user_bag_selections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Add constraint to item_type column on box_templates
ALTER TABLE public.box_templates 
ADD CONSTRAINT check_item_type 
CHECK (item_type IN ('standard', 'complimentary', 'customer_choice'));