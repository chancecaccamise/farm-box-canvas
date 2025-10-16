-- Update restaurant partner images to use local assets
UPDATE public.partners
SET 
  image_url = CASE slug
    WHEN 'Collueges-and-Lovers' THEN '/src/assets/colleaguesAndLoversPartner.jpg'
    WHEN 'eden-super-club' THEN '/src/assets/edenSupperClubPartner.jpg'
    WHEN 'fleeting' THEN '/src/assets/fleetingPartner.jpeg'
    WHEN 'Husk-Savannah' THEN '/src/assets/huskSavannahPartner.webp'
    WHEN 'Late-Air' THEN '/src/assets/lateAirPartner.webp'
    WHEN 'Marker-107' THEN '/src/assets/marker107Partner.webp'
    WHEN 'Repeal-33' THEN '/src/assets/repeal33Partner.jpg'
    WHEN 'Savoy-Society' THEN '/src/assets/sovoySocietyPartner.jpg'
    WHEN 'Sobremesa' THEN '/src/assets/sobremesaPartner.jpeg'
    WHEN 'Sundae-Cafe' THEN '/src/assets/sundaeCafePartner.jpeg'
    WHEN 'Water-Witch' THEN '/src/assets/waterWitchPartner.png'
    ELSE image_url
  END,
  header_image_url = CASE slug
    WHEN 'Collueges-and-Lovers' THEN '/src/assets/colleaguesAndLoversPartner.jpg'
    WHEN 'eden-super-club' THEN '/src/assets/edenSupperClubPartner.jpg'
    WHEN 'fleeting' THEN '/src/assets/fleetingPartner.jpeg'
    WHEN 'Husk-Savannah' THEN '/src/assets/huskSavannahPartner.webp'
    WHEN 'Late-Air' THEN '/src/assets/lateAirPartner.webp'
    WHEN 'Marker-107' THEN '/src/assets/marker107Partner.webp'
    WHEN 'Repeal-33' THEN '/src/assets/repeal33Partner.jpg'
    WHEN 'Savoy-Society' THEN '/src/assets/sovoySocietyPartner.jpg'
    WHEN 'Sobremesa' THEN '/src/assets/sobremesaPartner.jpeg'
    WHEN 'Sundae-Cafe' THEN '/src/assets/sundaeCafePartner.jpeg'
    WHEN 'Water-Witch' THEN '/src/assets/waterWitchPartner.png'
    ELSE header_image_url
  END,
  updated_at = now()
WHERE category = 'restaurants' 
  AND slug IN (
    'Collueges-and-Lovers',
    'eden-super-club',
    'fleeting',
    'Husk-Savannah',
    'Late-Air',
    'Marker-107',
    'Repeal-33',
    'Savoy-Society',
    'Sobremesa',
    'Sundae-Cafe',
    'Water-Witch'
  );