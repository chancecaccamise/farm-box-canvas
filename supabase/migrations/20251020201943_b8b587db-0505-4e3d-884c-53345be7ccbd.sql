-- Fix partner image paths to reference public folder correctly
UPDATE public.partners
SET 
  image_url = REPLACE(image_url, '/src/assets/', '/'),
  header_image_url = REPLACE(header_image_url, '/src/assets/', '/'),
  updated_at = now()
WHERE category = 'restaurants' 
  AND (image_url LIKE '/src/assets/%' OR header_image_url LIKE '/src/assets/%');