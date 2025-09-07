import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

interface BoxSize {
  id: string;
  name: string;
  display_name: string;
  base_price: number;
  subscriber_price: number;
  description: string | null;
  serves_text: string | null;
  item_count_range: string | null;
}

interface BagSelection {
  boxType: string;
  quantity: number;
}

interface MultiBagSelectorProps {
  isSubscription?: boolean;
  onSelectionChange: (selections: BagSelection[]) => void;
  currentSelections?: BagSelection[];
}

export function MultiBagSelector({ 
  isSubscription = false, 
  onSelectionChange, 
  currentSelections = []
}: MultiBagSelectorProps) {
  const [boxSizes, setBoxSizes] = useState<BoxSize[]>([]);
  const [selections, setSelections] = useState<BagSelection[]>(currentSelections);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadBoxSizes();
  }, []);

  useEffect(() => {
    setSelections(currentSelections);
  }, [currentSelections]);

  const loadBoxSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('box_sizes')
        .select('*')
        .eq('is_active', true)
        .order('base_price', { ascending: true });

      if (error) throw error;
      setBoxSizes(data || []);
    } catch (error) {
      console.error('Error loading box sizes:', error);
      toast({
        title: "Error",
        description: "Failed to load box options. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getQuantity = (boxType: string) => {
    const selection = selections.find(s => s.boxType === boxType);
    return selection ? selection.quantity : 0;
  };

  const updateQuantity = (boxType: string, newQuantity: number) => {
    const newSelections = [...selections];
    const existingIndex = newSelections.findIndex(s => s.boxType === boxType);
    
    if (newQuantity <= 0) {
      if (existingIndex >= 0) {
        newSelections.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex >= 0) {
        newSelections[existingIndex].quantity = newQuantity;
      } else {
        newSelections.push({ boxType, quantity: newQuantity });
      }
    }
    
    setSelections(newSelections);
    onSelectionChange(newSelections);
  };

  const getDisplayPrice = (basePrice: number, subscriberPrice?: number) => {
    return isSubscription ? (subscriberPrice || basePrice) : basePrice;
  };

  const getSavingsText = (basePrice: number, subscriberPrice?: number) => {
    if (isSubscription && subscriberPrice && subscriberPrice < basePrice) {
      const savings = basePrice - subscriberPrice;
      return `Save $${savings.toFixed(2)}/week`;
    }
    return null;
  };

  const getTotalPrice = () => {
    return selections.reduce((total, selection) => {
      const boxSize = boxSizes.find(b => b.name === selection.boxType);
      if (!boxSize) return total;
      const price = getDisplayPrice(boxSize.base_price, boxSize.subscriber_price);
      return total + (price * selection.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-primary" />
            <span>Select Your Bags</span>
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
          <Package className="w-5 h-5 text-primary" />
          <span>Select Your Bags</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Mix and match different bag types to create your perfect weekly order
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {boxSizes.map((boxSize) => (
          <div key={boxSize.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium">{boxSize.display_name}</h3>
                  {boxSize.name === 'full_farm_bag' && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Most Popular
                    </Badge>
                  )}
                </div>
                {boxSize.description && (
                  <p className="text-sm text-muted-foreground">{boxSize.description}</p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-muted-foreground">{boxSize.serves_text}</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{boxSize.item_count_range}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  ${getDisplayPrice(boxSize.base_price, boxSize.subscriber_price).toFixed(2)}/week
                </div>
                {getSavingsText(boxSize.base_price, boxSize.subscriber_price) && (
                  <div className="text-xs text-green-600">
                    {getSavingsText(boxSize.base_price, boxSize.subscriber_price)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(boxSize.name, getQuantity(boxSize.name) - 1)}
                  disabled={getQuantity(boxSize.name) <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">
                  {getQuantity(boxSize.name)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(boxSize.name, getQuantity(boxSize.name) + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {getQuantity(boxSize.name) > 0 && (
                <div className="text-sm font-medium">
                  Subtotal: ${(getDisplayPrice(boxSize.base_price, boxSize.subscriber_price) * getQuantity(boxSize.name)).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        ))}

        {selections.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Weekly Cost:</span>
              <span className="text-xl font-bold text-primary">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
            {getTotalPrice() >= 100 && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Custom Mode Available!</strong> Orders $100+ can skip the box structure and create a fully custom order.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}