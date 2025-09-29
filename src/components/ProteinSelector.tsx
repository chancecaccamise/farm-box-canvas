import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  onSelectionChange: (selectedProteins: Record<string, number>) => void;
  currentSelections?: Record<string, number>;
  weekStartDate?: string;
}

export function ProteinSelector({ 
  maxSelections = 5, 
  onSelectionChange, 
  currentSelections = {},
  weekStartDate 
}: ProteinSelectorProps) {
  const [proteins, setProteins] = useState<Product[]>([]);
  const [selectedProteins, setSelectedProteins] = useState<Record<string, number>>(currentSelections);
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

  const getTotalCount = () => {
    return Object.values(selectedProteins).reduce((sum, qty) => sum + qty, 0);
  };

  const increaseQuantity = (proteinId: string) => {
    const currentQty = selectedProteins[proteinId] || 0;
    const totalCount = getTotalCount();
    
    if (totalCount >= maxSelections) {
      toast({
        title: "Selection Limit Reached",
        description: `You can only select ${maxSelections} proteins total.`,
        variant: "destructive",
      });
      return;
    }
    
    const updatedSelections = {
      ...selectedProteins,
      [proteinId]: currentQty + 1
    };
    
    setSelectedProteins(updatedSelections);
    onSelectionChange(updatedSelections);
  };

  const decreaseQuantity = (proteinId: string) => {
    const currentQty = selectedProteins[proteinId] || 0;
    
    if (currentQty <= 0) return;
    
    const updatedSelections = { ...selectedProteins };
    
    if (currentQty === 1) {
      delete updatedSelections[proteinId];
    } else {
      updatedSelections[proteinId] = currentQty - 1;
    }
    
    setSelectedProteins(updatedSelections);
    onSelectionChange(updatedSelections);
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
          <span>Select Your Proteins ({getTotalCount()}/{maxSelections})</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose {maxSelections} proteins from our weekly selection (you can select multiple of the same item)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {proteins.map((protein) => {
            const quantity = selectedProteins[protein.id] || 0;
            const isSelected = quantity > 0;
            
            return (
              <div 
                key={protein.id} 
                className={`border-2 rounded-lg p-4 transition-colors ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{protein.name}</h3>
                    {protein.unit_description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {protein.unit_description}
                      </div>
                    )}
                    {protein.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {protein.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => decreaseQuantity(protein.id)}
                      disabled={quantity === 0}
                      className="h-10 w-10"
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => increaseQuantity(protein.id)}
                      disabled={getTotalCount() >= maxSelections}
                      className="h-10 w-10"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {getTotalCount() > 0 && (
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground">
              {getTotalCount() < maxSelections && (
                <p>You can select {maxSelections - getTotalCount()} more protein{maxSelections - getTotalCount() !== 1 ? 's' : ''}.</p>
              )}
              {getTotalCount() === maxSelections && (
                <p className="text-primary font-medium">✓ Perfect! You've selected all {maxSelections} proteins for your pack.</p>
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