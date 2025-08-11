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
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const { checkoutState } = useCheckout();

  useEffect(() => {
    fetchCheckoutData();
    checkSubscriptionStatus();
  }, [checkoutState]);

  // Redirect subscribers back to MyBag if they shouldn't be here
  useEffect(() => {
    if (hasActiveSubscription && user) {
      console.log('Subscriber detected on OrderSummary, redirecting to MyBag');
      navigate('/my-bag');
    }
  }, [hasActiveSubscription, user, navigate]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      const { data: subscriptionsData } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1);
      
      setHasActiveSubscription(subscriptionsData && subscriptionsData.length > 0);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

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
    console.log('🚀 CHECKOUT INITIATED');
    console.log('📋 Current checkout state:', JSON.stringify(checkoutState, null, 2));
    console.log('👤 User authenticated:', !!user, user?.email);
    
    if (!user) {
      console.log('🔐 No user, redirecting to auth');
      navigate('/auth');
      return;
    }

    // Validate checkout state (removed zipCode since it comes from delivery address)
    const requiredFields = ['boxType', 'boxSize', 'deliveryDay'];
    const missingFields = requiredFields.filter(field => !checkoutState[field as keyof typeof checkoutState]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      toast({
        title: "Incomplete Order",
        description: `Please complete: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Check if user has a delivery address with ZIP code
    console.log('📍 Checking user delivery address...');
    const { data: deliveryAddress, error: addressError } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();

    if (addressError) {
      console.error('❌ Error fetching delivery address:', addressError);
      toast({
        title: "Address Error",
        description: "Failed to verify delivery address. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryAddress || !deliveryAddress.zip_code) {
      console.error('❌ No delivery address or ZIP code found');
      toast({
        title: "Delivery Address Required",
        description: "Please add a delivery address with ZIP code in your account settings.",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Delivery address found:', deliveryAddress.zip_code);

    setIsCheckingOut(true);
    console.log('⏳ Setting checkout loading state');
    
    try {
      console.log('📞 Calling create-payment edge function...');
      
      const requestBody = {
        checkoutState,
        hasActiveSubscription,
      };
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: requestBody
      });

      console.log('📨 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('✅ Checkout URL received:', data.url);
        console.log('🔄 Attempting redirect to Stripe...');
        
        // Validate URL
        if (!data.url.includes('checkout.stripe.com')) {
          console.error('❌ Invalid Stripe URL received:', data.url);
          toast({
            title: "Error",
            description: "Invalid checkout URL received. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Small delay to ensure DOM is ready, then redirect
        setTimeout(() => {
          console.log('🚀 Executing redirect to:', data.url);
          
          // Primary method: Direct assignment
          try {
            window.location.href = data.url;
            console.log('✅ Primary redirect initiated');
          } catch (error) {
            console.error('❌ Primary redirect failed:', error);
            
            // Secondary method: Replace
            try {
              window.location.replace(data.url);
              console.log('✅ Secondary redirect initiated');
            } catch (error2) {
              console.error('❌ Secondary redirect failed:', error2);
              
              // Tertiary method: Open with _self
              try {
                window.open(data.url, '_self');
                console.log('✅ Tertiary redirect initiated');
              } catch (error3) {
                console.error('❌ All redirect methods failed:', error3);
                
                // Final fallback: Show manual link
                toast({
                  title: "Manual Checkout Required",
                  description: "Please click the link below to complete your payment",
                  action: (
                    <Button onClick={() => window.open(data.url, '_blank')}>
                      Open Stripe Checkout
                    </Button>
                  ),
                });
              }
            }
          }
          
          // Timeout detection
          setTimeout(() => {
            console.log('⚠️ Checking if redirect succeeded...');
            if (window.location.pathname === '/order-summary') {
              console.log('❌ Still on order summary page - redirect may have failed');
              toast({
                title: "Checkout Link",
                description: "If the page didn't redirect, click below:",
                action: (
                  <Button onClick={() => window.open(data.url, '_blank')}>
                    Open Checkout
                  </Button>
                ),
              });
            }
          }, 2000);
        }, 100);
        
      } else {
        console.error('❌ No checkout URL in response:', data);
        throw new Error('No checkout URL received from payment service');
      }
    } catch (error) {
      console.error('💥 Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Checkout Failed",
        description: `Error: ${errorMessage}. Please try again or contact support.`,
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
      console.log('🏁 Checkout process completed, loading state reset');
    }
  };

  const addOnTotal = addOnProducts.reduce((total, product) => {
    const quantity = checkoutState.addOns[product.id] || 0;
    return total + (product.price * quantity);
  }, 0);

  const deliveryFee = 0; // Free delivery
  const effectiveBoxPrice = hasActiveSubscription ? 0 : boxPrice;
  const totalAmount = effectiveBoxPrice + addOnTotal + deliveryFee;

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
          <h1 className="text-4xl font-bold mb-4">
            {hasActiveSubscription ? "Review Your Add-ons" : "Review Your Order"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {hasActiveSubscription 
              ? "Review your add-on selections before checkout"
              : "Double-check your selections before we prepare your farm box"
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Box Configuration - Hide for subscribers */}
            {!hasActiveSubscription && (
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
            )}

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

            {/* Box Details - Show different info for subscribers */}
            {!hasActiveSubscription && (
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
                      <p className="text-sm text-muted-foreground">
                        Fresh seasonal produce
                      </p>
                    </div>
                    <span className="font-medium">${boxPrice.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasActiveSubscription && (
              <Card className="shadow-soft border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Package className="w-5 h-5" />
                    Your Subscription Box
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Already included in your active subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-green-800">
                        {checkoutState.boxSize?.charAt(0).toUpperCase() + checkoutState.boxSize?.slice(1)} Box
                      </h3>
                      <p className="text-sm text-green-700">
                        Fresh seasonal produce (subscription active)
                      </p>
                    </div>
                    <span className="font-medium text-green-800">Included</span>
                  </div>
                </CardContent>
              </Card>
            )}

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
                <CardTitle>
                  {hasActiveSubscription ? "Add-on Summary" : "Order Summary"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {!hasActiveSubscription && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Box Price:</span>
                      <span>${boxPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {addOnProducts.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {hasActiveSubscription ? "Add-ons Total:" : "Add-ons Total:"}
                      </span>
                      <span>${addOnTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee:</span>
                    <span className="text-accent">Free</span>
                  </div>
                  {hasActiveSubscription && (
                    <div className="flex justify-between text-green-700">
                      <span>Subscription Box:</span>
                      <span>Included</span>
                    </div>
                  )}
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
                  {isCheckingOut 
                    ? "Creating Checkout..." 
                    : hasActiveSubscription 
                      ? `Checkout Add-ons - $${totalAmount.toFixed(2)}`
                      : `Checkout - $${totalAmount.toFixed(2)}`
                  }
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {hasActiveSubscription 
                      ? "You'll be redirected to secure checkout to purchase your add-ons."
                      : "You'll be redirected to secure checkout to complete your order."
                    }
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