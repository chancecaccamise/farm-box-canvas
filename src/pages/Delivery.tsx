import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Truck, CheckCircle, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type DeliveryDay = {
  id: string;
  day: string;
  date: string;
  available: boolean;
  popular?: boolean;
};

const Delivery = () => {
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [addOnProducts, setAddOnProducts] = useState<any[]>([]);
  const [boxPrice, setBoxPrice] = useState(0);
  const navigate = useNavigate();
  const { checkoutState } = useCheckout();
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock delivery options for the next week
  const deliveryDays: DeliveryDay[] = [
    {
      id: "tuesday",
      day: "Tuesday",
      date: "Jan 16",
      available: true,
      popular: true
    },
    {
      id: "wednesday", 
      day: "Wednesday",
      date: "Jan 17",
      available: true
    },
    {
      id: "thursday",
      day: "Thursday", 
      date: "Jan 18",
      available: true,
      popular: true
    },
    {
      id: "friday",
      day: "Friday",
      date: "Jan 19", 
      available: true
    },
    {
      id: "saturday",
      day: "Saturday",
      date: "Jan 20",
      available: false
    },
    {
      id: "sunday",
      day: "Sunday",
      date: "Jan 21",
      available: false
    }
  ];

  useEffect(() => {
    fetchCheckoutData();
  }, [checkoutState]);

  const fetchCheckoutData = async () => {
    try {
      // Fetch box price
      if (checkoutState.boxSize) {
        const { data: boxData } = await supabase
          .from('box_sizes')
          .select('base_price')
          .eq('name', checkoutState.boxSize)
          .single();
        setBoxPrice(boxData?.base_price || 0);
      }

      // Fetch add-on products
      if (Object.keys(checkoutState.addOns).length > 0) {
        const addOnIds = Object.keys(checkoutState.addOns);
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .in('id', addOnIds);
        setAddOnProducts(products || []);
      }
    } catch (error) {
      console.error('Error fetching checkout data:', error);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsCheckingOut(true);
    try {
      // Call the payment creation function with checkout state
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          checkoutState,
          hasActiveSubscription: false, // New customers don't have active subscriptions
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const addOnTotal = addOnProducts.reduce((total, product) => {
    const quantity = checkoutState.addOns[product.id] || 0;
    return total + (product.price * quantity);
  }, 0);

  const deliveryFee = 4.99;
  const totalAmount = boxPrice + addOnTotal + deliveryFee;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" asChild>
            <Link to="/add-ons">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Choose Your Delivery Day</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your preferred delivery day. We'll deliver fresh ingredients right to your door.
          </p>
        </div>

        {/* Delivery Info Card */}
        <Card className="mb-8 shadow-soft">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Weekly Delivery</h3>
                <p className="text-sm text-muted-foreground">Same day each week</p>
              </div>
              <div>
                <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Morning Delivery</h3>
                <p className="text-sm text-muted-foreground">Between 8 AM - 12 PM</p>
              </div>
              <div>
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Always Fresh</h3>
                <p className="text-sm text-muted-foreground">Packed the night before</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Days Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {deliveryDays.map((day) => (
            <Card
              key={day.id}
              className={`cursor-pointer transition-all duration-300 ${
                !day.available 
                  ? "opacity-50 cursor-not-allowed" 
                  : selectedDay === day.id
                    ? "ring-2 ring-primary shadow-medium"
                    : "hover:shadow-medium"
              }`}
              onClick={() => day.available && setSelectedDay(day.id)}
            >
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-lg">{day.day}</CardTitle>
                  {day.popular && day.available && (
                    <Badge variant="secondary" className="text-xs">Most Popular</Badge>
                  )}
                </div>
                <CardDescription className="text-base font-medium">
                  {day.date}
                </CardDescription>
                {selectedDay === day.id && (
                  <CheckCircle className="w-6 h-6 text-primary mx-auto mt-2" />
                )}
              </CardHeader>
              <CardContent className="text-center pt-0">
                {!day.available ? (
                  <Badge variant="destructive" className="text-xs">
                    Not Available
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    8 AM - 12 PM
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delivery Instructions */}
        <Card className="mb-8 bg-secondary/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Delivery Instructions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Deliveries are made between 8 AM and 12 PM on your selected day</li>
              <li>• No signature required - we'll leave your box in a safe location</li>
              <li>• You'll receive a text notification when your box is delivered</li>
              <li>• Refrigerated items are packed with ice packs to stay fresh</li>
              <li>• You can change your delivery day anytime before the weekly cutoff</li>
            </ul>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-8 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Box */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">
                  {checkoutState.boxSize?.charAt(0).toUpperCase() + checkoutState.boxSize?.slice(1)} Box
                </h3>
                <p className="text-sm text-muted-foreground">Fresh seasonal produce</p>
              </div>
              <span className="font-medium">${boxPrice.toFixed(2)}</span>
            </div>

            {/* Add-ons */}
            {addOnProducts.length > 0 && (
              <>
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Add-ons</h3>
                  {addOnProducts.map((product) => {
                    const quantity = checkoutState.addOns[product.id];
                    return (
                      <div key={product.id} className="flex justify-between items-center text-sm mb-1">
                        <span>{product.name} ×{quantity}</span>
                        <span>${(product.price * quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Pricing */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${(boxPrice + addOnTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Button */}
        <div className="text-center">
          <Button 
            onClick={handleCheckout}
            disabled={isCheckingOut || totalAmount <= 0}
            variant="hero"
            size="xl"
            className="w-full md:w-auto"
          >
            {isCheckingOut ? "Creating Checkout..." : `Checkout - $${totalAmount.toFixed(2)}`}
            <CheckCircle className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            You'll be redirected to secure checkout to complete your order.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Delivery;