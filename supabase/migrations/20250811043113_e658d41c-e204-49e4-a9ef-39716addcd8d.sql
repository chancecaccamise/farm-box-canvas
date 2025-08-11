-- Fix realtime setup - only add tables if not already added
DO $$
BEGIN
    -- Enable realtime for box_templates table
    ALTER TABLE public.box_templates REPLICA IDENTITY FULL;
    
    -- Try to add box_templates to publication, ignore if already exists
    BEGIN
        ALTER publication supabase_realtime ADD TABLE public.box_templates;
    EXCEPTION WHEN others THEN
        -- Table already in publication, ignore
        NULL;
    END;
    
    -- Enable realtime for weekly_bag_items table (already has REPLICA IDENTITY FULL)
    -- Try to add weekly_bag_items to publication, ignore if already exists  
    BEGIN
        ALTER publication supabase_realtime ADD TABLE public.weekly_bag_items;
    EXCEPTION WHEN others THEN
        -- Table already in publication, ignore
        NULL;
    END;
END $$;