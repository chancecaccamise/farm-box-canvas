import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Lock, Calendar, Tag, Truck } from "lucide-react";

interface WeeklyBagSummaryProps {
  weeklyBag: {
    id: string;
    subtotal: number;
    delivery_fee: number;
    total_amount: number;
    is_confirmed: boolean;
    cutoff_time: string;
  } | null;
  itemCount: number;
  onConfirmBag: () => void;
  isLocked: boolean;
  loading: boolean;
}

export function WeeklyBagSummary({ 
  weeklyBag, 
  itemCount, 
  onConfirmBag, 
  isLocked, 
  loading 
}: WeeklyBagSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const subtotal = weeklyBag?.subtotal || 0;
  const deliveryFee = weeklyBag?.delivery_fee || 4.99;
  const total = weeklyBag?.total_amount || (subtotal + deliveryFee);

  const formatDeliveryDate = () => {
    if (!weeklyBag?.cutoff_time) return "TBD";
    
    const cutoff = new Date(weeklyBag.cutoff_time);
    const deliveryDate = new Date(cutoff);
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Deliver 3 days after cutoff
    
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handlePromoCode = () => {
    // Placeholder functionality
    if (promoCode.toLowerCase() === "welcome10") {
      setPromoApplied(true);
    }
  };

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
      {/* Main Summary Card */}
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            This Week's Bag
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
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Delivery fee</span>
              <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            {promoApplied && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <span>Discount (WELCOME10)</span>
                <span>-$5.00</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>${(promoApplied ? Math.max(0, total - 5) : total).toFixed(2)}</span>
            </div>
          </div>

          {/* Promo Code Section */}
          {!weeklyBag?.is_confirmed && !isLocked && (
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

          {/* Confirm Button */}
          {weeklyBag?.is_confirmed ? (
            <Button className="w-full" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Bag Confirmed
            </Button>
          ) : isLocked ? (
            <Button className="w-full" disabled variant="destructive">
              <Lock className="h-4 w-4 mr-2" />
              Cutoff Passed
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={onConfirmBag}
              disabled={itemCount === 0}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Confirm My Bag
            </Button>
          )}

          {/* Cutoff Info */}
          {!weeklyBag?.is_confirmed && !isLocked && (
            <p className="text-xs text-center text-muted-foreground">
              You can modify your selections until the cutoff time
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}