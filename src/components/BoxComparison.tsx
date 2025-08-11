
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useAuth } from "@/components/AuthProvider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const BoxComparison = () => {
  const navigate = useNavigate();
  const { updateBoxSize, updateBoxType } = useCheckout();
  const { user } = useAuth();
  const [boxOptions, setBoxOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscription, setIsSubscription] = useState(true);

  useEffect(() => {
    const fetchBoxSizes = async () => {
      try {
        const { data: boxSizes, error } = await supabase
          .from('box_sizes')
          .select('*')
          .eq('is_active', true)
          .order('base_price', { ascending: true });

        if (error) throw error;

        const formattedBoxes = boxSizes.map((box, index) => ({
          size: box.name,
          name: box.display_name,
          basePrice: box.base_price,
          price: `$${box.base_price}`,
          items: box.item_count_range,
          serves: box.serves_text,
          sampleItems: getSampleItems(box.name),
          popular: box.name === 'medium' // Keep medium as most popular
        }));

        setBoxOptions(formattedBoxes);
      } catch (error) {
        console.error('Error fetching box sizes:', error);
        // Fallback to default data if there's an error
        setBoxOptions([
          {
            size: "small",
            name: "Small Box",
            basePrice: 35,
            price: "$35",
            items: "8-10 items",
            serves: "Perfect for 1-2 people",
            sampleItems: ["Rainbow Carrots", "Leafy Greens", "Heritage Tomatoes", "Fresh Herbs"],
            popular: false
          },
          {
            size: "medium", 
            name: "Medium Box",
            basePrice: 50,
            price: "$50",
            items: "12-15 items",
            serves: "Great for 2-4 people",
            sampleItems: ["Rainbow Carrots", "Leafy Greens", "Heritage Tomatoes", "Bell Peppers", "Fresh Fish", "Artisan Bread"],
            popular: true
          },
          {
            size: "large",
            name: "Large Box",
            basePrice: 70,
            price: "$70",
            items: "18-22 items",
            serves: "Ideal for 4+ people",
            sampleItems: ["Rainbow Carrots", "Leafy Greens", "Heritage Tomatoes", "Bell Peppers", "Fresh Fish", "Artisan Bread", "Seasonal Herbs", "Local Honey"],
            popular: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxSizes();
  }, []);

  const getSampleItems = (boxSize) => {
    const baseItems = ["Rainbow Carrots", "Leafy Greens", "Heritage Tomatoes"];
    
    if (boxSize === 'small') {
      return [...baseItems, "Fresh Herbs"];
    } else if (boxSize === 'medium') {
      return [...baseItems, "Bell Peppers", "Fresh Fish", "Artisan Bread"];
    } else {
      return [...baseItems, "Bell Peppers", "Fresh Fish", "Artisan Bread", "Seasonal Herbs", "Local Honey"];
    }
  };

  const handleSelectPlan = (boxSize) => {
    updateBoxSize(boxSize);
    updateBoxType(isSubscription ? 'subscription' : 'one-time');
    if (user) {
      navigate('/zip-code');
    } else {
      navigate('/auth');
    }
  };

  const getDisplayPrice = (basePrice) => {
    const price = isSubscription ? basePrice : basePrice + 5;
    return `$${price}`;
  };

  const getSavingsText = (basePrice) => {
    if (isSubscription) {
      return `Save $5 vs one-time purchase!`;
    }
    return null;
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading box options...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Choose Your Weekly Box</h2>
        <p className="text-xl text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Each box is carefully curated with the freshest local produce, sustainable seafood, and artisan goods
        </p>
        
        {/* Subscription Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-3 bg-card rounded-lg p-4 border shadow-sm">
            <Label htmlFor="subscription-toggle" className="text-sm font-medium">
              One-time purchase
            </Label>
            <Switch
              id="subscription-toggle"
              checked={isSubscription}
              onCheckedChange={setIsSubscription}
              className="data-[state=checked]:bg-accent"
            />
            <Label htmlFor="subscription-toggle" className="text-sm font-medium">
              Weekly subscription
            </Label>
            {isSubscription && (
              <Badge variant="secondary" className="ml-2 bg-accent/10 text-accent">
                Save $5/week
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {boxOptions.map((box) => (
            <Card key={box.size} className={`relative text-center ${box.popular ? 'ring-2 ring-accent shadow-lg scale-105' : ''}`}>
              {box.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-white">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl mb-2">{box.name}</CardTitle>
                <div className="text-4xl font-bold text-primary mb-2">{getDisplayPrice(box.basePrice)}</div>
                <div className="text-sm text-muted-foreground mb-1">
                  {isSubscription ? 'per week' : 'per delivery'}
                </div>
                {getSavingsText(box.basePrice) && (
                  <div className="text-xs text-accent font-medium mb-2">
                    {getSavingsText(box.basePrice)}
                  </div>
                )}
                <CardDescription className="text-base font-medium">{box.serves}</CardDescription>
                <div className="text-sm text-accent font-medium">{box.items}</div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-left">
                  <h4 className="font-semibold mb-3 text-center">What's Inside This Week:</h4>
                  <ul className="space-y-2">
                    {box.sampleItems.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className="w-full" 
                  variant={box.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(box.size)}
                >
                  Select This Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            {isSubscription 
              ? "All subscriptions include free delivery • Skip or pause anytime • Cancel without fees"
              : "One-time purchases include free delivery • No commitment required"
            }
          </p>
        </div>
      </div>
    </section>
  );
};

export default BoxComparison;
