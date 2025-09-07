import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Fish, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_description: string | null;
}

interface ProteinSelectorProps {
  maxSelections?: number;
  onSelectionChange: (selectedProteins: string[]) => void;
  currentSelections?: string[];
  weekStartDate?: string;
}

export function ProteinSelector({ 
  maxSelections = 5, 
  onSelectionChange, 
  currentSelections = [],
  weekStartDate 
}: ProteinSelectorProps) {
  const [proteins, setProteins] = useState<Product[]>([]);
  const [selectedProteins, setSelectedProteins] = useState<string[]>(currentSelections);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProteins();
  }, [weekStartDate]);

  useEffect(() => {
    setSelectedProteins(currentSelections);
  }, [currentSelections]);

  const loadProteins = async () => {
    try {
      // Load available proteins - in a real implementation, this could be filtered by weekly availability
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'proteins')
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      setProteins(data || []);
    } catch (error) {
      console.error('Error loading proteins:', error);
      toast({
        title: "Error",
        description: "Failed to load protein options. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProteinToggle = (proteinId: string) => {
    let newSelections = [...selectedProteins];
    
    if (newSelections.includes(proteinId)) {
      newSelections = newSelections.filter(id => id !== proteinId);
    } else {
      if (newSelections.length >= maxSelections) {
        toast({
          title: "Maximum Selection Reached",
          description: `You can select up to ${maxSelections} proteins for your pack.`,
          variant: "destructive",
        });
        return;
      }
      newSelections.push(proteinId);
    }
    
    setSelectedProteins(newSelections);
    onSelectionChange(newSelections);
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fish className="w-5 h-5 text-primary" />
            <span>Select Your Proteins</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Fish className="w-5 h-5 text-primary" />
          <span>Select Your Proteins ({selectedProteins.length}/{maxSelections})</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose {maxSelections} proteins from our weekly selection of premium meats and seafood
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proteins.map((protein) => (
            <div 
              key={protein.id} 
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedProteins.includes(protein.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => handleProteinToggle(protein.id)}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedProteins.includes(protein.id)}
                  onChange={() => handleProteinToggle(protein.id)}
                  disabled={!selectedProteins.includes(protein.id) && selectedProteins.length >= maxSelections}
                />
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="font-medium">{protein.name}</h3>
                    {protein.unit_description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {protein.unit_description}
                      </div>
                    )}
                  </div>
                  {protein.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {protein.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedProteins.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground">
              {selectedProteins.length < maxSelections && (
                <p>You can select {maxSelections - selectedProteins.length} more protein{maxSelections - selectedProteins.length !== 1 ? 's' : ''}.</p>
              )}
              {selectedProteins.length === maxSelections && (
                <p className="text-green-600">Perfect! You've selected all {maxSelections} proteins for your pack.</p>
              )}
            </div>
          </div>
        )}

        {proteins.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No proteins available for selection at this time.</p>
            <p className="text-sm">Please check back later or contact us for assistance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}