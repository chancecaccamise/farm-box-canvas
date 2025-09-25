-- Create news_announcements table
CREATE TABLE public.news_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "News announcements are viewable by everyone" 
ON public.news_announcements 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert news announcements" 
ON public.news_announcements 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update news announcements" 
ON public.news_announcements 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete news announcements" 
ON public.news_announcements 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_news_announcements_updated_at
BEFORE UPDATE ON public.news_announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();