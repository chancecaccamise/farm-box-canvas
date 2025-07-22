import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Fish } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FreshCatchAnnouncement {
  id: string;
  fish_name: string;
  fisherman_name: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export const AdminFreshCatch = () => {
  const [announcements, setAnnouncements] = useState<FreshCatchAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<FreshCatchAnnouncement | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fish_name: '',
    fisherman_name: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('fresh_catch_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fresh catch announcements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fish_name) {
      toast({
        title: "Error",
        description: "Fish name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const announcementData = {
        fish_name: formData.fish_name,
        fisherman_name: formData.fisherman_name || null,
        description: formData.description || null,
        image_url: formData.image_url || null
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('fresh_catch_announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Announcement updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('fresh_catch_announcements')
          .insert([announcementData]);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Announcement created successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (announcement: FreshCatchAnnouncement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      fish_name: announcement.fish_name,
      fisherman_name: announcement.fisherman_name || '',
      description: announcement.description || '',
      image_url: announcement.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await supabase
        .from('fresh_catch_announcements')
        .delete()
        .eq('id', announcementId);
      
      if (error) throw error;
      toast({
        title: "Success",
        description: "Announcement deleted successfully"
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      fish_name: '',
      fisherman_name: '',
      description: '',
      image_url: ''
    });
    setEditingAnnouncement(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fresh Catch Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'Add Fresh Catch Announcement'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fish_name">Fish Name *</Label>
                <Input
                  id="fish_name"
                  value={formData.fish_name}
                  onChange={(e) => setFormData({...formData, fish_name: e.target.value})}
                  placeholder="e.g., Atlantic Salmon"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fisherman_name">Fisherman Name</Label>
                <Input
                  id="fisherman_name"
                  value={formData.fisherman_name}
                  onChange={(e) => setFormData({...formData, fisherman_name: e.target.value})}
                  placeholder="e.g., Captain Mike"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the catch, preparation method, or other details..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/fish-image.jpg"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAnnouncement ? 'Update' : 'Create'} Announcement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex space-x-4 flex-1">
                  {announcement.image_url ? (
                    <img
                      src={announcement.image_url}
                      alt={announcement.fish_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <Fish className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{announcement.fish_name}</h3>
                    {announcement.fisherman_name && (
                      <p className="text-muted-foreground">by {announcement.fisherman_name}</p>
                    )}
                    {announcement.description && (
                      <p className="text-sm mt-2">{announcement.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Posted: {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
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

      {announcements.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Fish className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No fresh catch announcements yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first announcement to let customers know about fresh catches!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};