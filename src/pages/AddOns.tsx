import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Gift, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCheckout } from "@/contexts/CheckoutContext";

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  tags?: string[];
}

const AddOns = () => {
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateAddOns, checkoutState } = useCheckout();

  useEffect(() => {
    fetchAddOns();
    // Initialize selectedAddOns from checkout context
    setSelectedAddOns(checkoutState.addOns);
  }, [checkoutState.addOns]);

  const fetchAddOns = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .neq('category', 'vegetables') // Exclude basic vegetables - they're in the box
        .order('name');

      if (error) throw error;

      const formattedAddOns: AddOn[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        image: product.image,
        category: product.category,
        tags: product.tags || []
      }));

      setAddOns(formattedAddOns);
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      toast({
        title: "Error",
        description: "Failed to load add-ons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (addOnId: string, quantity: number) => {
    const newSelectedAddOns = { ...selectedAddOns };
    if (quantity <= 0) {
      delete newSelectedAddOns[addOnId];
    } else {
      newSelectedAddOns[addOnId] = quantity;
    }
    setSelectedAddOns(newSelectedAddOns);
  };

  const selectedCount = Object.keys(selectedAddOns).length;
  const totalSelected = Object.values(selectedAddOns).reduce((sum, qty) => sum + qty, 0);

  const handleContinue = () => {
    updateAddOns(selectedAddOns);
    navigate("/delivery");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" asChild>
            <Link to="/product-selection">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
            </Badge>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Enhance Your Box</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Add premium items and local specialties to make your box even more special
          </p>
        </div>

        {/* Add-Ons Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading add-ons...</p>
          </div>
        ) : addOns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No add-ons available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {addOns.map((addOn) => {
              const quantity = selectedAddOns[addOn.id] || 0;
              const isSelected = quantity > 0;
              const isPopular = addOn.tags?.includes('popular');
              const isPremium = addOn.category === 'meat' || addOn.category === 'fish';
              
              return (
                <Card 
                  key={addOn.id}
                  className={`transition-all duration-300 ${
                    isSelected 
                      ? "ring-2 ring-primary shadow-medium" 
                      : "hover:shadow-medium"
                  }`}
                >
                  {addOn.image && addOn.image !== '/api/placeholder/300/200' ? (
                    <div className="aspect-square w-full overflow-hidden rounded-t-lg">
                      <img
                        src={addOn.image}
                        alt={addOn.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-square w-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center rounded-t-lg">
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {addOn.category === 'meat' ? '🥩' : 
                           addOn.category === 'fish' ? '🐟' : 
                           addOn.category === 'dairy' ? '🥛' : 
                           addOn.category === 'Bakery' ? '🍞' : 
                           addOn.category === 'other' ? '🍯' : '🥬'}
                        </div>
                        <span className="text-sm text-muted-foreground">Fresh Product</span>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 flex-wrap">
                          {addOn.name}
                          {isPopular && (
                            <Badge variant="secondary">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          {isPremium && (
                            <Badge className="bg-gradient-fresh text-white">
                              Premium
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-lg font-semibold text-primary mt-2">
                          ${addOn.price.toFixed(2)}
                        </p>
                      </div>
                      {quantity > 0 && (
                        <Badge className="bg-primary/90 backdrop-blur-sm">
                          {quantity}x
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {addOn.description}
                    </CardDescription>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-center">
                      {quantity > 0 ? (
                        <div className="flex items-center gap-3 w-full">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(addOn.id, quantity - 1)}
                            className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(addOn.id, quantity + 1)}
                            className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => updateQuantity(addOn.id, 1)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Order
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary Section */}
        {selectedCount > 0 && (
          <Card className="mb-8 shadow-medium">
            <CardHeader>
              <CardTitle>Selected Add-Ons ({totalSelected} items)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {addOns
                  .filter(addOn => selectedAddOns[addOn.id] > 0)
                  .map(addOn => {
                    const qty = selectedAddOns[addOn.id];
                    return (
                      <div key={addOn.id} className="flex items-center justify-between py-2">
                        <div>
                          <span className="font-medium">{addOn.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">×{qty}</span>
                          <span className="text-primary font-semibold ml-2">
                            ${(addOn.price * qty).toFixed(2)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(addOn.id, 0)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })
                }
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Add-ons Total:</span>
                    <span className="text-primary">
                      ${addOns
                        .filter(addOn => selectedAddOns[addOn.id] > 0)
                        .reduce((total, addOn) => total + (addOn.price * selectedAddOns[addOn.id]), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            variant="hero"
            size="xl"
            className="w-full md:w-auto"
          >
            Continue to Delivery Options
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Add-ons are optional. You can always modify your selections later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddOns;