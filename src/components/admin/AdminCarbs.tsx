import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Wheat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_description: string | null;
  is_available: boolean;
}

export default function AdminCarbs() {
  const [carbs, setCarbs] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCarb, setEditingCarb] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit_description: "",
    is_available: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCarbs();
  }, []);

  const fetchCarbs = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "carbs")
        .order("name");

      if (error) throw error;
      setCarbs(data || []);
    } catch (error) {
      console.error("Error fetching carbs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch carbs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      unit_description: "",
      is_available: true,
    });
    setEditingCarb(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.unit_description?.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and unit description are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const carbData = {
        ...formData,
        category: "carbs",
        price: 0, // Default price as required by database
      };

      if (editingCarb) {
        const { error } = await supabase
          .from("products")
          .update(carbData)
          .eq("id", editingCarb.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Carb updated successfully!",
        });
      } else {
        const { error } = await supabase.from("products").insert([carbData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Carb created successfully!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCarbs();
    } catch (error: any) {
      console.error("Error saving carb:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save carb. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (carb: Product) => {
    setEditingCarb(carb);
    setFormData({
      name: carb.name,
      description: carb.description || "",
      unit_description: carb.unit_description || "",
      is_available: carb.is_available,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (carbId: string) => {
    if (!confirm("Are you sure you want to delete this carb?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", carbId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Carb deleted successfully!",
      });
      fetchCarbs();
    } catch (error: any) {
      console.error("Error deleting carb:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete carb. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (carbId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_available: !isAvailable })
        .eq("id", carbId);

      if (error) throw error;
      toast({
        title: "Success",
        description: `Carb ${!isAvailable ? "enabled" : "disabled"} successfully!`,
      });
      fetchCarbs();
    } catch (error: any) {
      console.error("Error updating carb availability:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update carb availability.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wheat className="w-6 h-6" />
            <span>Carbs Management</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Carb
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCarb ? "Edit Carb" : "Add New Carb"}
                </DialogTitle>
                <DialogDescription>
                  {editingCarb
                    ? "Update the carb information below."
                    : "Add a new carb to the system."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit_description" className="text-right">
                      Unit *
                    </Label>
                    <Input
                      id="unit_description"
                      value={formData.unit_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit_description: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="e.g., 1 loaf, 2 lb bag"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_available" className="text-right">
                      Available
                    </Label>
                    <Switch
                      id="is_available"
                      checked={formData.is_available}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_available: checked })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingCarb ? "Update Carb" : "Create Carb"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading carbs...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unit Description</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carbs.map((carb) => (
                <TableRow key={carb.id}>
                  <TableCell className="font-medium">{carb.name}</TableCell>
                  <TableCell>{carb.unit_description}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {carb.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={carb.is_available ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() =>
                        toggleAvailability(carb.id, carb.is_available)
                      }
                    >
                      {carb.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(carb)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(carb.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {carbs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No carbs found. Add one to get started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}