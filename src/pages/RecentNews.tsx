import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface NewsAnnouncement {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  author_name: string | null;
  created_at: string;
}

const RecentNews = () => {
  const [announcements, setAnnouncements] = useState<NewsAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('news_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching news announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Recent News
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest news and announcements from Billy's Botanicals
          </p>
        </div>

        {/* News Grid */}
        {announcements.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-muted-foreground mb-4">
              No news announcements yet
            </h3>
            <p className="text-muted-foreground">
              Check back soon for the latest updates from Billy's Botanicals!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {announcement.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={announcement.image_url}
                      alt={announcement.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {announcement.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    {announcement.author_name && (
                      <span>By {announcement.author_name}</span>
                    )}
                    <span>{format(new Date(announcement.created_at), 'MMM d, yyyy')}</span>
                  </div>

                  {announcement.description && (
                    <p className="text-muted-foreground line-clamp-3">
                      {announcement.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentNews;