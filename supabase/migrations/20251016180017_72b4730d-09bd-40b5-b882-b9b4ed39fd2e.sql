-- Remove Coastal Kitchen (never heard of them)
DELETE FROM public.partners WHERE id = '8e6c9eb0-b169-4b03-840b-437aa22cd69a';

-- Remove duplicate Eden Super Club
DELETE FROM public.partners WHERE id = '63bce9e7-fbe0-40e4-8020-afa80f04fd9e';

-- Move Swallowtail Pines to farmer partners (egg supplier)
UPDATE public.partners 
SET category = 'fisherman',
    description = 'Local egg supplier providing fresh, farm-raised eggs',
    updated_at = now()
WHERE id = '8557336d-55c3-4edf-aea1-58ef4daafec7';

-- Move The Green Spork to farmer partners (GF bread baker)
UPDATE public.partners 
SET category = 'fisherman',
    description = 'Specialty bakery providing our gluten-free bread',
    updated_at = now()
WHERE id = 'f0c48759-1d28-4c58-a3a2-b4f0af86e257';

-- Update Adam's Farm description to clarify farmer/produce partner
UPDATE public.partners 
SET description = 'Local farm providing fresh produce and farm goods',
    updated_at = now()
WHERE id = 'b5e8a6d2-3f4e-4c1a-9b7d-8e9f0a1b2c3d';

-- Add Bella Mia (pasta maker)
INSERT INTO public.partners (name, slug, category, description, is_active)
VALUES ('Bella Mia', 'bella-mia', 'bakery', 'Artisan pasta maker crafting our fresh pasta', true);

-- Add Captain Charlie (seafood)
INSERT INTO public.partners (name, slug, category, description, is_active)
VALUES ('Captain Charlie', 'captain-charlie', 'fisherman', 'Local seafood supplier providing fresh catch', true);

-- Add Grant at Betterfresh Farms (farmer partner)
INSERT INTO public.partners (name, slug, category, description, is_active)
VALUES ('Grant at Betterfresh Farms', 'grant-betterfresh-farms', 'fisherman', 'Local farm providing fresh produce', true);

-- Add Gannon Organics (farmer partner)
INSERT INTO public.partners (name, slug, category, description, is_active)
VALUES ('Gannon Organics', 'gannon-organics', 'fisherman', 'Organic farm providing certified organic produce', true);