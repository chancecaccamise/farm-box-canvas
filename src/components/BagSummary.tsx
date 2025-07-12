import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Calendar, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BagItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    name: string;
    price: number;
    category: string;
    image: string;
  };
}

interface BagSummaryProps {
  bagItems: Record<string, number>;
  isSubscription: boolean;
  onConfirmOrder: () => void;
}

export function BagSummary({ bagItems, isSubscription, onConfirmOrder }: BagSummaryProps) {
  const [bagDetails, setBagDetails] = useState<BagItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Object.keys(bagItems).length > 0) {
      fetchBagDetails();
    } else {
      setBagDetails([]);
    }
  }, [bagItems]);

  const fetchBagDetails = async () => {
    setLoading(true);
    try {
      const productIds = Object.keys(bagItems);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, image")
        .in("id", productIds);

      if (error) throw error;

      const bagDetailsWithQuantity = data.map(product => ({
        id: product.id,
        product_id: product.id,
        quantity: bagItems[product.id],
        products: {
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image,
        }
      }));

      setBagDetails(bagDetailsWithQuantity);
    } catch (error) {
      console.error("Error fetching bag details:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = Object.values(bagItems).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = bagDetails.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
  const deliveryFee = 4.99;
  const total = subtotal + deliveryFee;

  const categoryCount = bagDetails.reduce((acc, item) => {
    const category = item.products.category;
    acc[category] = (acc[category] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryColor = (category: string) => {
    const colors = {
      produce: "bg-green-100 text-green-800 border-green-200",
      protein: "bg-red-100 text-red-800 border-red-200",
      pantry: "bg-yellow-100 text-yellow-800 border-yellow-200",
      seafood: "bg-blue-100 text-blue-800 border-blue-200",
      herbs: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[category.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const nextDeliveryDate = new Date();
  nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 3);

  if (totalItems === 0) {
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
    <div className="space-y-4">
      {/* Order Summary */}
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {isSubscription ? "This Week's Box" : "Order Summary"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items in Bag */}
          <div className="space-y-2">
            {bagDetails.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <div className="font-medium">{item.products.name}</div>
                  <div className="text-muted-foreground">
                    {item.quantity} × ${item.products.price.toFixed(2)}
                  </div>
                </div>
                <div className="font-medium">
                  ${(item.products.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal ({totalItems} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Delivery</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <Truck className="h-4 w-4" />
              Next Delivery
            </div>
            <div className="text-sm text-muted-foreground">
              {nextDeliveryDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            className="w-full"
            onClick={onConfirmOrder}
            disabled={loading || totalItems === 0}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {isSubscription ? "Confirm This Week's Box" : "Place Order"}
          </Button>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {Object.keys(categoryCount).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contents Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryCount).map(([category, count]) => (
                <Badge key={category} className={getCategoryColor(category)}>
                  {count} {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}