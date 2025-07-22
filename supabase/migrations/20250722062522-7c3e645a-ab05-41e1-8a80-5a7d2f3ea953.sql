
-- Fix foreign key constraint to handle product deletion gracefully
ALTER TABLE box_templates 
DROP CONSTRAINT IF EXISTS box_templates_product_id_fkey;

-- Add new foreign key with CASCADE delete
ALTER TABLE box_templates 
ADD CONSTRAINT box_templates_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Create index for better performance on product queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_box_templates_week_size ON box_templates(week_start_date, box_size);

-- Create storage bucket for fresh catch images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('fresh-catch-images', 'fresh-catch-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for fresh catch images
CREATE POLICY "Admins can upload fresh catch images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fresh-catch-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update fresh catch images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fresh-catch-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete fresh catch images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fresh-catch-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Everyone can view fresh catch images"
ON storage.objects FOR SELECT
USING (bucket_id = 'fresh-catch-images');
