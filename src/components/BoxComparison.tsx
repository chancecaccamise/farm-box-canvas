
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
          subscriberPrice: box.subscriber_price,
          price: `$${box.base_price}`,
          items: box.item_count_range,
          serves: box.serves_text,
          description: box.description,
          sampleItems: getSampleItems(box.name),
          popular: box.name === 'full_farm_bag' // Ana's Full Farm Bag is most popular
        }));

        setBoxOptions(formattedBoxes);
      } catch (error) {
        console.error('Error fetching box sizes:', error);
        // Fallback - should not happen as database now has clean 3 boxes
        console.error('Failed to fetch box sizes from database');
        setBoxOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxSizes();
  }, []);

  const getSampleItems = (boxSize) => {
    switch (boxSize) {
      case 'veggie_bag':
        return [
          '6 fresh items delivered weekly',
          'Handpicked by Billy and Ana',
          'Seasonal vegetables and greens',
          'Value of $30 or more'
        ];
      case 'full_farm_bag':
        return [
          '1 protein chosen by the customer',
          '1 carb chosen by the customer',
          '5 items handpicked weekly by Billy and Ana',
          'Value of $50 or more'
        ];
      case 'protein-pack':
        return [
          '5 premium proteins of your choice',
          'Includes seafood and meat options',
          'Customer selected weekly',
          'Value of $100 or more'
        ];
      default:
        return [];
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

  const getDisplayPrice = (basePrice, subscriberPrice) => {
    if (isSubscription && subscriberPrice && subscriberPrice < basePrice) {
      return {
        strikethrough: `$${basePrice}`,
        price: `$${subscriberPrice}`,
        showStrikethrough: true
      };
    }
    const price = isSubscription ? (subscriberPrice || basePrice) : basePrice;
    return {
      price: `$${price}`,
      showStrikethrough: false
    };
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
        <h2 className="text-4xl font-bold text-center mb-4">Choose Your Weekly Experience</h2>
        <p className="text-xl text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          From fresh vegetables to premium proteins, each option is crafted with Ana's expertise and local partnerships
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
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {boxOptions.map((box) => {
            const priceDisplay = getDisplayPrice(box.basePrice, box.subscriberPrice);
            
            return (
            <Card key={box.size} className={`relative text-center flex flex-col justify-between h-full ${box.popular ? 'ring-2 ring-accent shadow-lg scale-105' : ''}`}>
              {box.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-white">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl mb-2">{box.name}</CardTitle>
                <div className="text-4xl font-bold text-primary mb-2">
                  {priceDisplay.showStrikethrough ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="line-through text-muted-foreground text-2xl">
                        {priceDisplay.strikethrough}
                      </span>
                      <span className="text-accent">
                        {priceDisplay.price}
                      </span>
                    </div>
                  ) : (
                    priceDisplay.price
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  {isSubscription ? 'per week' : 'per delivery'}
                </div>
                <CardDescription className="text-base font-medium">{box.serves}</CardDescription>
                <div className="text-sm text-accent font-medium">{box.items}</div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-left">
                  <h4 className="font-semibold mb-3 text-center">What's Included in This Bag:</h4>
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
          )
          })}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            All orders include a $9.00 delivery fee
          </p>
        </div>
      </div>
    </section>
  );
};

export default BoxComparison;
