-- Update 1540 Tasting Room to use local image
UPDATE partners 
SET image_url = '/src/assets/1540TastingRoom.jpg',
    header_image_url = '/src/assets/1540TastingRoom.jpg',
    updated_at = now()
WHERE slug = '1540-tasting-room';

-- Update Cha Bella to use local image  
UPDATE partners
SET image_url = '/src/assets/chaBella.jpg',
    header_image_url = '/src/assets/chaBella.jpg', 
    updated_at = now()
WHERE slug = 'cha-bella';