
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { PaymentConfirmationDialog } from "@/components/PaymentConfirmationDialog";

interface BoxSize {
  id: string;
  name: string;
  display_name: string;
  base_price: number;
  description: string | null;
  serves_text: string | null;
  item_count_range: string | null;
}

interface BoxSizeSelectorProps {
  currentBoxSize?: string;
  onBoxSizeChange: (newBoxSize: string, newPrice: number) => void;
  isConfirmed?: boolean;
}

export function BoxSizeSelector({ currentBoxSize = "medium", onBoxSizeChange, isConfirmed = false }: BoxSizeSelectorProps) {
  const [boxSizes, setBoxSizes] = useState<BoxSize[]>([]);
  const [selectedSize, setSelectedSize] = useState(currentBoxSize);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadBoxSizes();
  }, []);

  useEffect(() => {
    setSelectedSize(currentBoxSize);
  }, [currentBoxSize]);

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
        description: "Failed to load box sizes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSizeChange = () => {
    if (selectedSize === currentBoxSize) return;
    
    const currentPrice = getCurrentPrice();
    const newPrice = getSelectedPrice();
    const isUpgrade = newPrice > currentPrice;
    
    // Show confirmation dialog for upgrades or if bag is confirmed
    if (isUpgrade || isConfirmed) {
      setShowPaymentDialog(true);
    } else {
      // Direct change for downgrades on unconfirmed bags
      performBoxSizeChange();
    }
  };

  const performBoxSizeChange = async () => {
    if (!user || selectedSize === currentBoxSize) return;

    setSaving(true);
    try {
      const selectedBoxSize = boxSizes.find(size => size.name === selectedSize);
      if (!selectedBoxSize) return;

      // Get or create current week bag with new box size
      const { data: bagId, error: bagError } = await supabase
        .rpc('get_or_create_current_week_bag_with_size', {
          user_uuid: user.id,
          box_size_name: selectedSize
        });

      if (bagError) throw bagError;

      const timing = isConfirmed ? "next week's" : "this week's";
      toast({
        title: "Box Size Updated",
        description: `Your box has been changed to ${selectedBoxSize.display_name}. Changes will apply to ${timing} delivery.`,
      });

      onBoxSizeChange(selectedSize, selectedBoxSize.base_price);
    } catch (error) {
      console.error('Error updating box size:', error);
      toast({
        title: "Error",
        description: "Failed to update box size. Please try again.",
        variant: "destructive",
      });
      setSelectedSize(currentBoxSize); // Reset on error
    } finally {
      setSaving(false);
    }
  };

  const getCurrentPrice = () => {
    const currentSize = boxSizes.find(size => size.name === currentBoxSize);
    return currentSize?.base_price || 0;
  };

  const getSelectedPrice = () => {
    const selectedBoxSize = boxSizes.find(size => size.name === selectedSize);
    return selectedBoxSize?.base_price || 0;
  };

  const getPriceDifference = () => {
    const currentPrice = getCurrentPrice();
    const selectedPrice = getSelectedPrice();
    return selectedPrice - currentPrice;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-primary" />
            <span>Box Size & Pricing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
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
          <span>Box Size & Pricing</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
          {boxSizes.map((boxSize) => (
            <div key={boxSize.id} className="flex items-center space-x-3 border rounded-lg p-4">
              <RadioGroupItem value={boxSize.name} id={boxSize.name} />
              <Label htmlFor={boxSize.name} className="flex-1 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{boxSize.display_name}</div>
                    {boxSize.description && (
                      <div className="text-sm text-muted-foreground">{boxSize.description}</div>
                    )}
                    {boxSize.serves_text && (
                      <div className="text-sm text-muted-foreground">Serves {boxSize.serves_text}</div>
                    )}
                    {boxSize.item_count_range && (
                      <div className="text-sm text-muted-foreground">{boxSize.item_count_range} items</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${boxSize.base_price.toFixed(2)}/week</div>
                    {boxSize.name === currentBoxSize && (
                      <Badge variant="secondary" className="mt-1">Current</Badge>
                    )}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {selectedSize !== currentBoxSize && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <AlertCircle className="w-4 h-4 text-primary" />
              <div className="text-sm">
                {getPriceDifference() > 0 ? (
                  <span>
                    You'll pay an additional <strong>${getPriceDifference().toFixed(2)}</strong> for your next delivery.
                  </span>
                ) : getPriceDifference() < 0 ? (
                  <span>
                    You'll save <strong>${Math.abs(getPriceDifference()).toFixed(2)}</strong> on your next delivery.
                  </span>
                ) : (
                  <span>No price change for your next delivery.</span>
                )}
              </div>
            </div>
            {isConfirmed && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This week's bag is already confirmed. Changes will apply to next week's delivery.
                </p>
              </div>
            )}
            <Button onClick={handleSizeChange} disabled={saving} className="w-full">
              {saving ? "Updating..." : "Update Box Size"}
            </Button>
          </div>
        )}

        <PaymentConfirmationDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          currentBoxSize={currentBoxSize}
          newBoxSize={selectedSize}
          currentPrice={getCurrentPrice()}
          newPrice={getSelectedPrice()}
          onConfirm={performBoxSizeChange}
          isConfirmed={isConfirmed}
        />
      </CardContent>
    </Card>
  );
}
