import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Newspaper } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { format } from 'date-fns';

interface NewsAnnouncement {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  author_name: string | null;
  created_at: string;
}

interface FormData {
  title: string;
  description: string;
  image_url: string;
  author_name: string;
}

export const AdminRecentNews = () => {
  const [announcements, setAnnouncements] = useState<NewsAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<NewsAnnouncement | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image_url: '',
    author_name: ''
  });
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to fetch news announcements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from('news_announcements')
          .update({
            title: formData.title,
            description: formData.description || null,
            image_url: formData.image_url || null,
            author_name: formData.author_name || null
          })
          .eq('id', editingAnnouncement.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "News announcement updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('news_announcements')
          .insert({
            title: formData.title,
            description: formData.description || null,
            image_url: formData.image_url || null,
            author_name: formData.author_name || null
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "News announcement created successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving news announcement:', error);
      toast({
        title: "Error",
        description: "Failed to save news announcement",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (announcement: NewsAnnouncement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description || '',
      image_url: announcement.image_url || '',
      author_name: announcement.author_name || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this news announcement?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('news_announcements')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "News announcement deleted successfully"
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting news announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete news announcement",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      author_name: ''
    });
    setEditingAnnouncement(null);
  };

  if (loading) {
    return <div className="p-4">Loading news announcements...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Recent News Management</h2>
          <p className="text-muted-foreground">Create and manage news announcements</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add News
        </Button>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No news announcements</h3>
            <p className="text-muted-foreground">Get started by creating your first news announcement.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      {announcement.image_url && (
                        <img
                          src={announcement.image_url}
                          alt={announcement.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{announcement.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {announcement.author_name && `By ${announcement.author_name} • `}
                          {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    {announcement.description && (
                      <p className="text-muted-foreground mt-2 line-clamp-2">
                        {announcement.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit News Announcement' : 'Add News Announcement'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter news title"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Author</label>
              <Input
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                placeholder="Enter author name (e.g., Billy, Ana)"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter news description"
                rows={4}
              />
            </div>

            <div>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="News Image"
                placeholder="Upload an image or enter URL"
                bucketName="fresh-catch-images"
                folder="news"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingAnnouncement ? 'Update' : 'Create'} News
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};