
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Lock, Calendar, Tag, Truck, Clock, CheckCircle } from "lucide-react";

interface WeeklyBagSummaryProps {
  weeklyBag: {
    id: string;
    subtotal: number;
    delivery_fee: number;
    total_amount: number;
    is_confirmed: boolean;
    cutoff_time: string;
    box_price: number;
    addons_total: number;
  } | null;
  itemCount: number;
  onCheckout: () => void;
  isLocked: boolean;
  loading: boolean;
  hasActiveSubscription?: boolean;
}

export function WeeklyBagSummary({ 
  weeklyBag, 
  itemCount, 
  onCheckout, 
  isLocked, 
  loading,
  hasActiveSubscription = false
}: WeeklyBagSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const boxPrice = weeklyBag?.box_price || 0;
  const addonsTotal = weeklyBag?.addons_total || 0;
  
  // Updated delivery fee logic
  const deliveryFee = hasActiveSubscription ? 0 : 4.99;
  
  const subtotal = boxPrice + addonsTotal;
  
  // Updated total calculation
  const getTotal = () => {
    if (hasActiveSubscription) {
      // For subscribers, only charge for add-ons (no delivery fee)
      return addonsTotal;
    } else {
      // For one-time customers, charge for everything including delivery
      return subtotal + deliveryFee;
    }
  };

  const total = getTotal();

  const formatDeliveryDate = () => {
    if (!weeklyBag?.cutoff_time) return "TBD";
    
    const cutoff = new Date(weeklyBag.cutoff_time);
    const deliveryDate = new Date(cutoff);
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setPromoApplied(true);
    }
  };

  const getCheckoutButtonText = () => {
    if (weeklyBag?.is_confirmed) {
      return "Bag Confirmed";
    }
    
    if (hasActiveSubscription) {
      return addonsTotal > 0 ? "Checkout" : "Confirm Your Bag";
    } else {
      return "Checkout";
    }
  };

  const shouldShowCheckoutButton = () => {
    if (weeklyBag?.is_confirmed) {
      return false; // Don't show checkout for confirmed bags
    }
    
    if (hasActiveSubscription) {
      return true; // Always show for subscribers (they can confirm even without add-ons)
    } else {
      return itemCount > 0; // Show checkout if there are any items
    }
  };

  // Determine if editing should be disabled - when cutoff has passed OR bag is confirmed
  const isEditingDisabled = isLocked || weeklyBag?.is_confirmed;

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <Card className="sticky top-6">
        <CardContent className="pt-6 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">Your bag is empty</h3>
          <p className="text-muted-foreground">Add some products to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {hasActiveSubscription ? "This Week's Summary" : "Order Summary"}
            {weeklyBag?.is_confirmed && (
              <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Item Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Items in bag</span>
            <span className="font-medium">{itemCount}</span>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
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
            {promoApplied && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <span>Discount (WELCOME10)</span>
                <span>-$5.00</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total to pay</span>
              <span>${(promoApplied ? Math.max(0, total - 5) : total).toFixed(2)}</span>
            </div>
          </div>

          {/* Promo Code Section - only show if not locked/confirmed and there's something to checkout */}
          {!isEditingDisabled && shouldShowCheckoutButton() && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Promo Code</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePromoCode}
                    disabled={promoApplied || !promoCode}
                  >
                    Apply
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600">Promo code applied successfully!</p>
                )}
              </div>
            </>
          )}

          {/* Delivery Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <Truck className="h-4 w-4" />
              Estimated Delivery
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDeliveryDate()}
            </div>
          </div>

          {/* Status Info */}
          {weeklyBag?.is_confirmed && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-green-800 mb-1">
                <CheckCircle className="h-4 w-4" />
                Bag Confirmed
              </div>
              <div className="text-xs text-green-700">
                Your bag is confirmed and ready for delivery.
              </div>
            </div>
          )}

          {isEditingDisabled && !weeklyBag?.is_confirmed && (
            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-1">
                <Clock className="h-4 w-4" />
                Cutoff Time Passed
              </div>
              <div className="text-xs text-muted-foreground">
                Changes are no longer allowed for this week's bag.
              </div>
            </div>
          )}

          {/* Checkout Button */}
          {weeklyBag?.is_confirmed ? (
            <Button className="w-full" disabled variant="default">
              <CheckCircle className="h-4 w-4 mr-2" />
              Bag Confirmed
            </Button>
          ) : isEditingDisabled ? (
            <Button className="w-full" disabled variant="destructive">
              <Lock className="h-4 w-4 mr-2" />
              Cutoff Passed
            </Button>
          ) : shouldShowCheckoutButton() ? (
            <Button
              className="w-full"
              onClick={onCheckout}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {getCheckoutButtonText()}
            </Button>
          ) : (
            <Button className="w-full" disabled variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add Items to Continue
            </Button>
          )}

          {/* Additional Info */}
          {!isEditingDisabled && !weeklyBag?.is_confirmed && (
            <p className="text-xs text-center text-muted-foreground">
              {hasActiveSubscription 
                ? "Your subscription box will be delivered automatically. You can add extras and confirm until the cutoff time."
                : "You can modify your selections until the cutoff time"
              }
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
