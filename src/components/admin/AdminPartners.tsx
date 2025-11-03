import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  name: string;
  slug: string;
  category: 'restaurants' | 'bakery' | 'fisherman';
  description: string | null;
  bio: string | null;
  story: string | null;
  image_url: string | null;
  header_image_url: string | null;
  location: string | null;
  rating: number;
  partnership_duration: string | null;
  specialties: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PartnerForm {
  name: string;
  slug: string;
  category: 'restaurants' | 'bakery' | 'fisherman';
  description: string;
  bio: string;
  story: string;
  image_url: string;
  header_image_url: string;
  location: string;
  rating: number;
  partnership_duration: string;
  specialties: string;
}

const categories = [
  { value: "restaurants", label: "Restaurants", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "bakery", label: "Bakery Partners", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  { value: "fisherman", label: "Sustainable Food Partners", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" }
];

export const AdminPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const { toast } = useToast();

  const emptyForm: PartnerForm = {
    name: '',
    slug: '',
    category: 'restaurants',
    description: '',
    bio: '',
    story: '',
    image_url: '',
    header_image_url: '',
    location: '',
    rating: 5.0,
    partnership_duration: '',
    specialties: ''
  };

  const [formData, setFormData] = useState<PartnerForm>(emptyForm);

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    filterPartners();
  }, [partners, searchTerm, categoryFilter]);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners((data || []) as Partner[]);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast({
        title: "Error",
        description: "Failed to load partners",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPartners = () => {
    let filtered = [...partners];

    if (searchTerm) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.story?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(partner => partner.category === categoryFilter);
    }

    setFilteredPartners(filtered);
  };

  const generateSlug = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleAddPartner = async () => {
    if (!formData.name || !formData.image_url) {
      toast({
        title: "Error",
        description: "Partner name and profile image are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const specialtiesArray = formData.specialties
        ? formData.specialties.split(',').map(s => s.trim()).filter(s => s)
        : null;

      const { error } = await supabase
        .from('partners')
        .insert({
          name: formData.name,
          slug: formData.slug,
          category: formData.category,
          description: formData.description || null,
          bio: formData.bio || null,
          story: formData.story || null,
          image_url: formData.image_url,
          header_image_url: formData.header_image_url || null,
          location: formData.location || null,
          rating: formData.rating,
          partnership_duration: formData.partnership_duration || null,
          specialties: specialtiesArray,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partner added successfully"
      });

      setIsAddDialogOpen(false);
      setFormData(emptyForm);
      fetchPartners();
    } catch (error) {
      console.error('Error adding partner:', error);
      toast({
        title: "Error",
        description: "Failed to add partner",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePartner = async () => {
    if (!editingPartner || !formData.name || !formData.image_url) {
      toast({
        title: "Error",
        description: "Partner name and profile image are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const specialtiesArray = formData.specialties
        ? formData.specialties.split(',').map(s => s.trim()).filter(s => s)
        : null;

      const { error } = await supabase
        .from('partners')
        .update({
          name: formData.name,
          slug: formData.slug,
          category: formData.category,
          description: formData.description || null,
          bio: formData.bio || null,
          story: formData.story || null,
          image_url: formData.image_url,
          header_image_url: formData.header_image_url || null,
          location: formData.location || null,
          rating: formData.rating,
          partnership_duration: formData.partnership_duration || null,
          specialties: specialtiesArray
        })
        .eq('id', editingPartner.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partner updated successfully"
      });

      setIsEditDialogOpen(false);
      setEditingPartner(null);
      setFormData(emptyForm);
      fetchPartners();
    } catch (error) {
      console.error('Error updating partner:', error);
      toast({
        title: "Error",
        description: "Failed to update partner",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (partner: Partner) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ is_active: !partner.is_active })
        .eq('id', partner.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Partner ${!partner.is_active ? 'activated' : 'deactivated'} successfully`
      });

      fetchPartners();
    } catch (error) {
      console.error('Error toggling partner status:', error);
      toast({
        title: "Error",
        description: "Failed to update partner status",
        variant: "destructive"
      });
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partner deleted successfully"
      });

      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      slug: partner.slug,
      category: partner.category,
      description: partner.description || '',
      bio: partner.bio || '',
      story: partner.story || '',
      image_url: partner.image_url || '',
      header_image_url: partner.header_image_url || '',
      location: partner.location || '',
      rating: partner.rating,
      partnership_duration: partner.partnership_duration || '',
      specialties: partner.specialties?.join(', ') || ''
    });
    setIsEditDialogOpen(true);
  };

  const getCategoryLabel = (value: string) => {
    return categories.find(c => c.value === value)?.label || value;
  };

  const getCategoryColor = (value: string) => {
    return categories.find(c => c.value === value)?.color || '';
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading partners...</div>;
  }

  const PartnerFormFields = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div>
        <Label htmlFor="name">Partner Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter partner name"
          required
        />
      </div>

      <div>
        <Label htmlFor="slug">URL Slug *</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="partner-slug"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="City, State"
        />
      </div>

      <div>
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the partner"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Detailed bio"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="story">Story</Label>
        <Textarea
          id="story"
          value={formData.story}
          onChange={(e) => setFormData({ ...formData, story: e.target.value })}
          placeholder="Partner's story"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="partnership_duration">Partnership Duration</Label>
        <Input
          id="partnership_duration"
          value={formData.partnership_duration}
          onChange={(e) => setFormData({ ...formData, partnership_duration: e.target.value })}
          placeholder="e.g., Since 2020"
        />
      </div>

      <div>
        <Label htmlFor="rating">Rating</Label>
        <Input
          id="rating"
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
        />
      </div>

      <div>
        <Label htmlFor="specialties">Specialties (comma-separated)</Label>
        <Input
          id="specialties"
          value={formData.specialties}
          onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
          placeholder="Specialty 1, Specialty 2, Specialty 3"
        />
      </div>

      <div>
        <ImageUpload
          label="Profile Image *"
          value={formData.image_url}
          onChange={(url) => setFormData({ ...formData, image_url: url })}
          bucketName="product-images"
          folder="partners"
        />
      </div>

      <div>
        <ImageUpload
          label="Header Image"
          value={formData.header_image_url}
          onChange={(url) => setFormData({ ...formData, header_image_url: url })}
          bucketName="product-images"
          folder="partners/headers"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Local Partners</h2>
          <p className="text-muted-foreground">Manage your local restaurant, bakery, and food partners</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(emptyForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Partner</DialogTitle>
            </DialogHeader>
            <PartnerFormFields />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddPartner}>Add Partner</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No partners found</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Partner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <Card key={partner.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header Image */}
                {partner.header_image_url && (
                  <div className="h-32 overflow-hidden bg-muted">
                    <img
                      src={partner.header_image_url}
                      alt={`${partner.name} header`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Profile Image */}
                <div className="p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {partner.image_url ? (
                        <img
                          src={partner.image_url}
                          alt={partner.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{partner.name}</h3>
                      <Badge className={getCategoryColor(partner.category)}>
                        {getCategoryLabel(partner.category)}
                      </Badge>
                    </div>
                  </div>

                  {partner.location && (
                    <p className="text-sm text-muted-foreground mb-2">{partner.location}</p>
                  )}

                  {partner.description && (
                    <p className="text-sm line-clamp-2 mb-3">{partner.description}</p>
                  )}

                  {partner.specialties && partner.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {partner.specialties.slice(0, 3).map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {partner.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{partner.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={partner.is_active}
                        onCheckedChange={() => handleToggleActive(partner)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {partner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(partner)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePartner(partner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
          </DialogHeader>
          <PartnerFormFields />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePartner}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};