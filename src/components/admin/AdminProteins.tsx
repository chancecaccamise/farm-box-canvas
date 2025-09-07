import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Fish, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Protein {
  id: string;
  name: string;
  description: string | null;
  unit_description: string | null;
  is_available: boolean;
}

export const AdminProteins = () => {
  const [proteins, setProteins] = useState<Protein[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProtein, setEditingProtein] = useState<Protein | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit_description: "",
    is_available: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProteins();
  }, []);

  const loadProteins = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'proteins')
        .order('name');

      if (error) throw error;
      setProteins(data || []);
    } catch (error) {
      console.error('Error loading proteins:', error);
      toast({
        title: "Error",
        description: "Failed to load proteins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const proteinData = {
      name: formData.name,
      description: formData.description || null,
      category: 'proteins',
      price: 0, // Default price since we're not managing prices in admin
      unit_description: formData.unit_description || null,
      is_available: formData.is_available,
    };

    try {
      if (editingProtein) {
        const { error } = await supabase
          .from('products')
          .update(proteinData)
          .eq('id', editingProtein.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Protein updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(proteinData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Protein added successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadProteins();
    } catch (error) {
      console.error('Error saving protein:', error);
      toast({
        title: "Error",
        description: "Failed to save protein",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (protein: Protein) => {
    setEditingProtein(protein);
    setFormData({
      name: protein.name,
      description: protein.description || "",
      unit_description: protein.unit_description || "",
      is_available: protein.is_available,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this protein?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Protein deleted successfully",
      });
      loadProteins();
    } catch (error) {
      console.error('Error deleting protein:', error);
      toast({
        title: "Error",
        description: "Failed to delete protein",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (protein: Protein) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !protein.is_available })
        .eq('id', protein.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Protein ${!protein.is_available ? 'enabled' : 'disabled'} successfully`,
      });
      loadProteins();
    } catch (error) {
      console.error('Error updating protein availability:', error);
      toast({
        title: "Error",
        description: "Failed to update protein availability",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      unit_description: "",
      is_available: true,
    });
    setEditingProtein(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading proteins...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Protein Management</h2>
          <p className="text-muted-foreground">
            Manage proteins available for the seafood protein pack selection
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Protein
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProtein ? 'Edit Protein' : 'Add New Protein'}
              </DialogTitle>
              <DialogDescription>
                {editingProtein 
                  ? 'Update the protein details below.'
                  : 'Add a new protein to the seafood selection.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="unit_description">Unit Description</Label>
                <Input
                  id="unit_description"
                  placeholder="e.g., 1 lb fillet"
                  value={formData.unit_description}
                  onChange={(e) => setFormData({...formData, unit_description: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                />
                <Label htmlFor="is_available">Available for selection</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProtein ? 'Update' : 'Create'} Protein
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="w-5 h-5" />
            Available Proteins ({proteins.length})
          </CardTitle>
          <CardDescription>
            Proteins that customers can select for their seafood protein pack
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unit Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proteins.map((protein) => (
                <TableRow key={protein.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{protein.name}</div>
                      {protein.description && (
                        <div className="text-sm text-muted-foreground">
                          {protein.description.length > 60 
                            ? `${protein.description.substring(0, 60)}...`
                            : protein.description
                          }
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{protein.unit_description || '-'}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      protein.is_available 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {protein.is_available ? "Available" : "Disabled"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAvailability(protein)}
                      >
                        <Switch
                          checked={protein.is_available}
                          onCheckedChange={() => toggleAvailability(protein)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(protein)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(protein.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {proteins.length === 0 && (
            <div className="text-center py-8">
              <Fish className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No proteins found</p>
              <p className="text-sm text-muted-foreground">
                Add proteins to allow customers to select them for their seafood protein pack
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};