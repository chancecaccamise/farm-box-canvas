import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Calendar, ShoppingCart, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useCheckout } from "@/contexts/CheckoutContext";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [addOnProducts, setAddOnProducts] = useState<any[]>([]);
  const [boxPrice, setBoxPrice] = useState(0);
  const { checkoutState } = useCheckout();

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
            <Link to="/delivery">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Review Your Order</h1>
          <p className="text-xl text-muted-foreground">
            Double-check your selections before we prepare your farm box
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Box Configuration */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Box Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Box Type:</span>
                  <span className="font-medium">{checkoutState.boxType === 'subscription' ? 'Subscription' : 'One-Time'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Box Size:</span>
                  <span className="font-medium">{checkoutState.boxSize?.charAt(0).toUpperCase() + checkoutState.boxSize?.slice(1)} Box</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Day:</span>
                  <span className="font-medium">{checkoutState.deliveryDay || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Time:</span>
                  <span className="font-medium">8 AM - 12 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ZIP Code:</span>
                  <span className="font-medium">{checkoutState.zipCode || 'Not provided'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Box Details */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Box Contents
                </CardTitle>
                <CardDescription>
                  Your {checkoutState.boxSize} box selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {checkoutState.boxSize?.charAt(0).toUpperCase() + checkoutState.boxSize?.slice(1)} Box
                    </h3>
                    <p className="text-sm text-muted-foreground">Fresh seasonal produce</p>
                  </div>
                  <span className="font-medium">${boxPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Add-Ons */}
            {addOnProducts.length > 0 && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Add-Ons ({Object.keys(checkoutState.addOns).length})</CardTitle>
                  <CardDescription>
                    Premium additions to enhance your box
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {addOnProducts.map((product) => {
                      const quantity = checkoutState.addOns[product.id];
                      return (
                        <div key={product.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <div>
                              <span className="text-sm font-medium">{product.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">×{quantity}</span>
                            </div>
                            <Badge variant="secondary" className="ml-auto">Add-on</Badge>
                          </div>
                          <span className="font-medium">${(product.price * quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-medium">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Box Price:</span>
                    <span>${boxPrice.toFixed(2)}</span>
                  </div>
                  {addOnProducts.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Add-ons Total:</span>
                      <span>${addOnTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee:</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isCheckingOut || totalAmount <= 0}
                >
                  {isCheckingOut ? "Creating Checkout..." : `Checkout - $${totalAmount.toFixed(2)}`}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    You'll be redirected to secure checkout to complete your order.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;