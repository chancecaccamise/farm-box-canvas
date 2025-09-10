import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Wheat, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_description: string | null;
}

interface CarbSelectorProps {
  maxSelections?: number;
  onSelectionChange: (selectedCarbs: string[]) => void;
  currentSelections?: string[];
  weekStartDate?: string;
}

export function CarbSelector({ 
  maxSelections = 1, 
  onSelectionChange, 
  currentSelections = [],
  weekStartDate 
}: CarbSelectorProps) {
  const [carbs, setCarbs] = useState<Product[]>([]);
  const [selectedCarbs, setSelectedCarbs] = useState<string[]>(currentSelections);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCarbs();
  }, [weekStartDate]);

  useEffect(() => {
    setSelectedCarbs(currentSelections);
  }, [currentSelections]);

  const loadCarbs = async () => {
    try {
      // Load available carbs
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'carbs')
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      setCarbs(data || []);
    } catch (error) {
      console.error('Error loading carbs:', error);
      toast({
        title: "Error",
        description: "Failed to load carb options. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCarbToggle = (carbId: string) => {
    let newSelections = [...selectedCarbs];
    
    if (newSelections.includes(carbId)) {
      newSelections = newSelections.filter(id => id !== carbId);
    } else {
      if (maxSelections === 1) {
        // For single selection, replace existing selection
        newSelections = [carbId];
      } else {
        // For multiple selections, check limit
        if (newSelections.length >= maxSelections) {
          toast({
            title: "Maximum Selection Reached",
            description: `You can select up to ${maxSelections} carb${maxSelections > 1 ? 's' : ''} for your pack.`,
            variant: "destructive",
          });
          return;
        }
        newSelections.push(carbId);
      }
    }
    
    setSelectedCarbs(newSelections);
    onSelectionChange(newSelections);
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wheat className="w-5 h-5 text-primary" />
            <span>Select Your Carbs</span>
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
          <Wheat className="w-5 h-5 text-primary" />
          <span>Select Your Carbs ({selectedCarbs.length}/{maxSelections})</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose {maxSelections} carb{maxSelections > 1 ? 's' : ''} from our weekly selection of fresh grains and starches
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {carbs.map((carb) => (
            <div 
              key={carb.id} 
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedCarbs.includes(carb.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => handleCarbToggle(carb.id)}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedCarbs.includes(carb.id)}
                  onChange={() => handleCarbToggle(carb.id)}
                  disabled={!selectedCarbs.includes(carb.id) && selectedCarbs.length >= maxSelections}
                />
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="font-medium">{carb.name}</h3>
                    {carb.unit_description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {carb.unit_description}
                      </div>
                    )}
                  </div>
                  {carb.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {carb.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedCarbs.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground">
              {selectedCarbs.length < maxSelections && (
                <p>You can select {maxSelections - selectedCarbs.length} more carb{maxSelections - selectedCarbs.length !== 1 ? 's' : ''}.</p>
              )}
              {selectedCarbs.length === maxSelections && (
                <p className="text-green-600">Perfect! You've selected all {maxSelections} carb{maxSelections > 1 ? 's' : ''} for your pack.</p>
              )}
            </div>
          </div>
        )}

        {carbs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No carbs available for selection at this time.</p>
            <p className="text-sm">Please check back later or contact us for assistance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}