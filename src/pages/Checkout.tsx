
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, CreditCard, Truck, Calendar } from "lucide-react";

interface CheckoutPageProps {}

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Get data passed from MyBag page
  const { weeklyBag, bagItems, hasActiveSubscription } = location.state || {};

  useEffect(() => {
    // Redirect back to MyBag if no data is provided
    if (!weeklyBag || !bagItems) {
      navigate('/my-bag');
    }
  }, [weeklyBag, bagItems, navigate]);

  if (!weeklyBag || !bagItems) {
    return null; // Will redirect
  }

  const boxItems = bagItems.filter((item: any) => item.item_type === 'box_item');
  const addonItems = bagItems.filter((item: any) => item.item_type === 'addon');
  
  const boxPrice = weeklyBag.box_price || 0;
  const addonsTotal = weeklyBag.addons_total || 0;
  const deliveryFee = hasActiveSubscription ? 0 : 4.99;
  
  const getTotal = () => {
    if (hasActiveSubscription) {
      return addonsTotal; // Only charge for add-ons
    } else {
      return boxPrice + addonsTotal + deliveryFee; // Charge for everything
    }
  };

  const total = getTotal();

  const formatWeekDate = () => {
    const startDate = new Date(weeklyBag.week_start_date);
    const endDate = new Date(weeklyBag.week_end_date);
    
    return `${startDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    })} - ${endDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    })}`;
  };

  const formatDeliveryDate = () => {
    const cutoff = new Date(weeklyBag.cutoff_time);
    const deliveryDate = new Date(cutoff);
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleStripeCheckout = async () => {
    setLoading(true);
    // TODO: Integrate with Stripe here
    // For now, just show a placeholder
    console.log('Processing payment...', {
      total,
      hasActiveSubscription,
      itemsCount: bagItems.length
    });
    
    // Simulate processing delay
    setTimeout(() => {
      setLoading(false);
      // TODO: Navigate to success page after successful payment
      navigate('/my-bag');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/my-bag')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Bag
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
              <p className="text-muted-foreground">
                Review your order for the week of {formatWeekDate()}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Box Items */}
                  {boxItems.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        Your {weeklyBag.box_size?.charAt(0).toUpperCase() + weeklyBag.box_size?.slice(1)} Box
                      </h3>
                      <div className="space-y-3">
                        {boxItems.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                                {item.products.image ? (
                                  <img
                                    src={item.products.image}
                                    alt={item.products.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    No Image
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{item.products.name}</h4>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            {hasActiveSubscription && (
                              <Badge variant="outline" className="text-green-600 border-green-300">
                                Included
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add-ons */}
                  {addonItems.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Add-Ons</h3>
                      <div className="space-y-3">
                        {addonItems.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                                {item.products.image ? (
                                  <img
                                    src={item.products.image}
                                    alt={item.products.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    No Image
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{item.products.name}</h4>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                ${(item.price_at_time * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Estimated Delivery:</span>
                      <span>{formatDeliveryDate()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Delivery address and preferences can be managed in your account settings.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {!hasActiveSubscription && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Box contents</span>
                        <span>${boxPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {addonsTotal > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Add-ons</span>
                        <span>${addonsTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span>Delivery fee</span>
                      <span>{hasActiveSubscription ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
                    </div>
                    {hasActiveSubscription && (
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Box contents (subscription)</span>
                        <span>Included</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleStripeCheckout}
                    disabled={loading || total === 0}
                  >
                    {loading ? (
                      "Processing..."
                    ) : total === 0 ? (
                      "No Payment Required"
                    ) : (
                      `Pay $${total.toFixed(2)}`
                    )}
                  </Button>

                  {hasActiveSubscription && total === 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Your subscription box will be delivered automatically at no additional cost.
                    </p>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    By proceeding, you agree to our{" "}
                    <Link to="/terms" className="underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="underline">Privacy Policy</Link>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
