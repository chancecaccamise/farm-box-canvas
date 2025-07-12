import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Calendar, MapPin, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Mock order data - in a real app this would come from state/context
  const orderDetails = {
    boxType: "Subscription",
    boxSize: "Medium Box (12-15 items)",
    deliveryDay: "Thursday, Jan 18",
    zipCode: "12345",
    selectedItems: [
      "Bell Pepper Trio",
      "Leafy Greens Mix", 
      "Heritage Tomatoes",
      "Rainbow Carrots",
      "Free-Range Chicken Breast",
      "Wild-Caught Salmon",
      "Farm Fresh Eggs",
      "Artisan Sourdough",
      "Local Wildflower Honey",
      "Extra Virgin Olive Oil",
      "Artisan Cheese Selection",
      "Grass-Fed Ground Beef"
    ],
    addOns: [
      "Artisan Bread Box",
      "Fresh Herb Bundle",
      "Premium Manuka Honey"
    ]
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    
    setIsPlacingOrder(true);
    
    try {
      // Create subscription
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          subscription_type: 'weekly',
          status: 'active'
        });

      if (subError) throw subError;

      // Create initial weekly bag
      const { data: bagId, error: bagError } = await supabase
        .rpc('get_or_create_current_week_bag', { user_uuid: user.id });

      if (bagError) throw bagError;

      // Create order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_type: 'subscription',
          status: 'confirmed',
          total_amount: 0 // Will be calculated later
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Store selected items in context for confirmation page to create bag items
      localStorage.setItem('checkoutItems', JSON.stringify(orderDetails.selectedItems));
      localStorage.setItem('checkoutAddOns', JSON.stringify(orderDetails.addOns));
      localStorage.setItem('bagId', bagId);

      toast({
        title: "Order Placed!",
        description: "Your subscription has been created successfully.",
      });

      navigate("/confirmation");
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

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
                  <span className="font-medium">{orderDetails.boxType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Box Size:</span>
                  <span className="font-medium">{orderDetails.boxSize}</span>
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
                  <span className="font-medium">{orderDetails.deliveryDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Time:</span>
                  <span className="font-medium">8 AM - 12 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ZIP Code:</span>
                  <span className="font-medium">{orderDetails.zipCode}</span>
                </div>
              </CardContent>
            </Card>

            {/* Selected Items */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Selected Items ({orderDetails.selectedItems.length})</CardTitle>
                <CardDescription>
                  Fresh ingredients for your weekly box
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-2">
                  {orderDetails.selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 py-1">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add-Ons */}
            {orderDetails.addOns.length > 0 && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Add-Ons ({orderDetails.addOns.length})</CardTitle>
                  <CardDescription>
                    Premium additions to enhance your box
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {orderDetails.addOns.map((addOn, index) => (
                      <div key={index} className="flex items-center gap-2 py-1">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span className="text-sm">{addOn}</span>
                        <Badge variant="secondary" className="ml-auto">Add-on</Badge>
                      </div>
                    ))}
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
                    <span className="text-muted-foreground">Box Items:</span>
                    <span>{orderDetails.selectedItems.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Add-Ons:</span>
                    <span>{orderDetails.addOns.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery:</span>
                    <span>Weekly {orderDetails.deliveryDay.split(',')[0]}s</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="text-center py-4 bg-secondary/50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">
                      Total: {orderDetails.selectedItems.length + orderDetails.addOns.length} Items
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Pricing will be calculated at checkout
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? "Creating Subscription..." : "Place Order"}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    This is a demo order. No payment will be processed.
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