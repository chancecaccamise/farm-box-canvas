import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Star, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .in('category', ['addon', 'specialty', 'premium', 'local'])
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

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [addOnId]: !prev[addOnId]
    }));
  };

  const selectedCount = Object.values(selectedAddOns).filter(Boolean).length;

  const handleContinue = () => {
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
            <Badge variant="secondary">{selectedCount} add-ons selected</Badge>
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
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {addOns.map((addOn) => {
              const isSelected = selectedAddOns[addOn.id] || false;
              const isPopular = addOn.tags?.includes('popular');
              const isPremium = addOn.category === 'premium';
              
              return (
                <Card 
                  key={addOn.id}
                  className={`transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? "ring-2 ring-primary shadow-medium" 
                      : "hover:shadow-medium"
                  }`}
                  onClick={() => toggleAddOn(addOn.id)}
                >
                  {addOn.image && (
                    <div className="aspect-square w-full overflow-hidden rounded-t-lg">
                      <img
                        src={addOn.image}
                        alt={addOn.name}
                        className="w-full h-full object-cover"
                      />
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
                      <Switch
                        checked={isSelected}
                        onCheckedChange={() => toggleAddOn(addOn.id)}
                        className="ml-4"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {addOn.description}
                    </CardDescription>
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
              <CardTitle>Selected Add-Ons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {addOns
                  .filter(addOn => selectedAddOns[addOn.id])
                  .map(addOn => (
                    <div key={addOn.id} className="flex items-center justify-between py-2">
                      <div>
                        <span className="font-medium">{addOn.name}</span>
                        <span className="text-primary font-semibold ml-2">${addOn.price.toFixed(2)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAddOn(addOn.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                }
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