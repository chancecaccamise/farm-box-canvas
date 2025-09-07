-- Add seafood protein pack as a special box size
INSERT INTO public.box_sizes (
  name, 
  display_name, 
  description, 
  base_price, 
  subscriber_price, 
  item_count_range, 
  serves_text, 
  is_active
) VALUES (
  'protein-pack',
  'Seafood Protein Pack',
  'Choose 5 premium proteins from our weekly selection of fresh seafood and meats',
  89.99,
  79.99,
  '5 proteins',
  'Perfect for protein lovers',
  true
);