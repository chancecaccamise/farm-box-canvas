import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Search, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ServiceableZipCode {
  zip_code: string;
  city: string;
  state: string;
  is_active: boolean;
  created_at: string;
}

export const AdminDeliveryAreas = () => {
  const [newZipCode, setNewZipCode] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zipToDelete, setZipToDelete] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: zipCodes = [], isLoading } = useQuery({
    queryKey: ["admin-zip-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('serviceable_zip_codes')
        .select('*')
        .order('zip_code');
      
      if (error) throw error;
      return data as ServiceableZipCode[];
    },
  });

  const filteredZipCodes = zipCodes.filter(
    (zip) =>
      zip.zip_code.includes(searchTerm) ||
      zip.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zip.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddZipCode = async () => {
    if (!newZipCode || !newCity || !newState) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newZipCode.length !== 5 || !/^\d+$/.test(newZipCode)) {
      toast({
        title: "Error",
        description: "ZIP code must be exactly 5 digits",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('serviceable_zip_codes')
        .insert({
          zip_code: newZipCode,
          city: newCity.trim(),
          state: newState.trim().toUpperCase(),
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Error",
            description: "This ZIP code already exists",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "ZIP code added successfully",
      });

      setNewZipCode("");
      setNewCity("");
      setNewState("");
      queryClient.invalidateQueries({ queryKey: ["admin-zip-codes"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ZIP code",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteZipCode = async (zipCode: string) => {
    try {
      const { error } = await supabase
        .from('serviceable_zip_codes')
        .delete()
        .eq('zip_code', zipCode);

      if (error) throw error;

      toast({
        title: "Success",
        description: "ZIP code removed successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-zip-codes"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove ZIP code",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setZipToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Add New ZIP Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add New Delivery Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="zip-code">ZIP Code</Label>
              <Input
                id="zip-code"
                value={newZipCode}
                onChange={(e) => setNewZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                placeholder="12345"
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Los Angeles"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={newState}
                onChange={(e) => setNewState(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="CA"
                maxLength={2}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddZipCode} disabled={isAdding} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {isAdding ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Delivery Areas ({filteredZipCodes.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ZIP codes, cities, or states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading delivery areas...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ZIP Code</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredZipCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No ZIP codes match your search" : "No delivery areas configured"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredZipCodes.map((zip) => (
                      <TableRow key={zip.zip_code}>
                        <TableCell className="font-mono">{zip.zip_code}</TableCell>
                        <TableCell>{zip.city}</TableCell>
                        <TableCell>{zip.state}</TableCell>
                        <TableCell>
                          <Badge variant={zip.is_active ? "default" : "secondary"}>
                            {zip.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(zip.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setZipToDelete(zip.zip_code);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Delivery Area</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove ZIP code {zipToDelete}? This will prevent new customers in this area from signing up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => zipToDelete && handleDeleteZipCode(zipToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};