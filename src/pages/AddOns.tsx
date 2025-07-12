import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Star, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface AddOn {
  id: string;
  name: string;
  description: string;
  popular?: boolean;
  premium?: boolean;
}

const AddOns = () => {
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const addOns: AddOn[] = [
    {
      id: "premium-honey",
      name: "Premium Manuka Honey", 
      description: "Rare New Zealand Manuka honey with unique healing properties",
      premium: true
    },
    {
      id: "artisan-bread-box",
      name: "Artisan Bread Box",
      description: "Selection of 3 fresh-baked breads from local bakeries", 
      popular: true
    },
    {
      id: "herb-garden",
      name: "Fresh Herb Bundle",
      description: "Basil, rosemary, thyme, and parsley for your cooking",
      popular: true
    },
    {
      id: "coffee-blend",
      name: "Single-Origin Coffee",
      description: "Freshly roasted beans from our partner coffee roaster"
    },
    {
      id: "flower-bouquet",
      name: "Seasonal Flower Bouquet",
      description: "Beautiful locally grown flowers to brighten your home"
    },
    {
      id: "fermented-foods",
      name: "Fermented Foods Pack",
      description: "Kombucha, kimchi, and sauerkraut for gut health"
    },
    {
      id: "nut-butter",
      name: "Artisan Nut Butter",
      description: "Small-batch almond or peanut butter made locally"
    },
    {
      id: "seasonal-fruit",
      name: "Seasonal Fruit Box",
      description: "Premium selection of the season's best fruits"
    }
  ];

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
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {addOns.map((addOn) => {
            const isSelected = selectedAddOns[addOn.id] || false;
            
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
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {addOn.name}
                        {addOn.popular && (
                          <Badge variant="secondary">
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {addOn.premium && (
                          <Badge className="bg-gradient-fresh text-white">
                            Premium
                          </Badge>
                        )}
                      </CardTitle>
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
                      <span className="font-medium">{addOn.name}</span>
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