import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "./ImageUpload";
import { Camera, Edit, Trash2, Plus, Eye, EyeOff } from "lucide-react";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const AdminGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newImage, setNewImage] = useState({
    title: "",
    description: "",
    category: "wedding",
    image_url: "",
  });

  const categories = [
    { value: "wedding", label: "Weddings" },
    { value: "celebration", label: "Celebrations" },
    { value: "commercial", label: "Commercial Clients" },
    { value: "seasonal", label: "Seasonal Bouquets" },
  ];

  const categoryColors: Record<string, string> = {
    wedding: "bg-rose-100 text-rose-800",
    celebration: "bg-yellow-100 text-yellow-800",
    commercial: "bg-blue-100 text-blue-800",
    seasonal: "bg-green-100 text-green-800",
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, searchTerm, categoryFilter]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      toast({
        title: "Error",
        description: "Failed to fetch gallery images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterImages = () => {
    let filtered = images;

    if (searchTerm) {
      filtered = filtered.filter(
        (image) =>
          image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          image.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((image) => image.category === categoryFilter);
    }

    setFilteredImages(filtered);
  };

  const handleAddImage = async () => {
    try {
      if (!newImage.title || !newImage.image_url) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const maxSortOrder = Math.max(...images.map(img => img.sort_order), 0);

      const { data, error } = await supabase
        .from("gallery_images")
        .insert({
          ...newImage,
          sort_order: maxSortOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setImages([...images, data]);
      setNewImage({ title: "", description: "", category: "wedding", image_url: "" });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Gallery image added successfully",
      });
    } catch (error) {
      console.error("Error adding image:", error);
      toast({
        title: "Error",
        description: "Failed to add gallery image",
        variant: "destructive",
      });
    }
  };

  const handleUpdateImage = async () => {
    try {
      if (!editingImage) return;

      const { error } = await supabase
        .from("gallery_images")
        .update({
          title: editingImage.title,
          description: editingImage.description,
          category: editingImage.category,
          image_url: editingImage.image_url,
        })
        .eq("id", editingImage.id);

      if (error) throw error;

      setImages(images.map(img => img.id === editingImage.id ? editingImage : img));
      setIsEditDialogOpen(false);
      setEditingImage(null);

      toast({
        title: "Success",
        description: "Gallery image updated successfully",
      });
    } catch (error) {
      console.error("Error updating image:", error);
      toast({
        title: "Error",
        description: "Failed to update gallery image",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (image: GalleryImage) => {
    try {
      const { error } = await supabase
        .from("gallery_images")
        .update({ is_active: !image.is_active })
        .eq("id", image.id);

      if (error) throw error;

      setImages(images.map(img => 
        img.id === image.id ? { ...img, is_active: !img.is_active } : img
      ));

      toast({
        title: "Success",
        description: `Image ${!image.is_active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error("Error toggling image status:", error);
      toast({
        title: "Error",
        description: "Failed to update image status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (image: GalleryImage) => {
    try {
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", image.id);

      if (error) throw error;

      setImages(images.filter(img => img.id !== image.id));

      toast({
        title: "Success",
        description: "Gallery image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete gallery image",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading gallery images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ana's Gallery Management</h2>
          <p className="text-muted-foreground">
            Manage arrangement photos displayed in the gallery
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Gallery Image</DialogTitle>
              <DialogDescription>
                Upload a new arrangement photo to the gallery
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newImage.title}
                  onChange={(e) => setNewImage({...newImage, title: e.target.value})}
                  placeholder="Enter image title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newImage.description}
                  onChange={(e) => setNewImage({...newImage, description: e.target.value})}
                  placeholder="Enter image description"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newImage.category} onValueChange={(value) => setNewImage({...newImage, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image *</Label>
                <ImageUpload
                  value={newImage.image_url}
                  onChange={(url) => setNewImage({...newImage, image_url: url})}
                  bucketName="product-images"
                  folder="gallery"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddImage}>Add Image</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <Card key={image.id} className={`${!image.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-muted">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{image.title}</h3>
                  <Badge className={categoryColors[image.category as keyof typeof categoryColors]}>
                    {categories.find(c => c.value === image.category)?.label}
                  </Badge>
                </div>
                {image.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {image.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={image.is_active}
                      onCheckedChange={() => handleToggleActive(image)}
                    />
                    <span className="text-sm">
                      {image.is_active ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingImage(image);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteImage(image)}
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

      {filteredImages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No images found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first gallery image"}
            </p>
            {!searchTerm && categoryFilter === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Image
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingImage && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Gallery Image</DialogTitle>
              <DialogDescription>
                Update the details for this gallery image
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({...editingImage, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingImage.description || ""}
                  onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editingImage.category} onValueChange={(value) => setEditingImage({...editingImage, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image *</Label>
                <ImageUpload
                  value={editingImage.image_url}
                  onChange={(url) => setEditingImage({...editingImage, image_url: url})}
                  bucketName="product-images"
                  folder="gallery"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateImage}>Update Image</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};