
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";

interface SimplifiedOrderSummaryProps {
  weeklyBag: any;
  bagItems: any[];
  hasActiveSubscription: boolean;
}

export default function SimplifiedOrderSummary({ 
  weeklyBag, 
  bagItems, 
  hasActiveSubscription 
}: SimplifiedOrderSummaryProps) {
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

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Order Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Week of {formatWeekDate()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Box Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                {weeklyBag.box_size?.charAt(0).toUpperCase() + weeklyBag.box_size?.slice(1)} Box
              </h3>
              <p className="text-sm text-muted-foreground">Fresh seasonal produce</p>
            </div>
            <div className="text-right">
              {hasActiveSubscription ? (
                <span className="text-sm text-green-600 font-medium">Included</span>
              ) : (
                <span className="font-medium">${boxPrice.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Add-ons Summary */}
        {addonItems.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-medium">Add-ons</h3>
              {addonItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.products.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      ${(item.price_at_time * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pricing Breakdown */}
        <Separator />
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

        {hasActiveSubscription && total === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700 text-center">
              Your subscription box will be delivered automatically at no additional cost.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
