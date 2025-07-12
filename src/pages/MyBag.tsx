import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PreviousOrders } from "@/components/PreviousOrders";
import { ProductGrid } from "@/components/ProductGrid";
import { BagSummary } from "@/components/BagSummary";
import { BagItemsList } from "@/components/BagItemsList";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image: string;
  };
}

function MyBag() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bagItems, setBagItems] = useState<Record<string, number>>({});
  const [isSubscription, setIsSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchBagItems(),
        checkSubscriptionStatus()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  const fetchBagItems = async () => {
    try {
      const { data, error } = await supabase
        .from("current_bag")
        .select("product_id, quantity")
        .eq("user_id", user?.id);

      if (error) throw error;

      const bagItemsMap = data.reduce((acc, item) => {
        acc[item.product_id] = item.quantity;
        return acc;
      }, {} as Record<string, number>);

      setBagItems(bagItemsMap);
    } catch (error) {
      console.error("Error fetching bag items:", error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("subscription_type, status")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setIsSubscription(!!data);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  const updateBagQuantity = async (productId: string, quantity: number) => {
    try {
      const newBagItems = { ...bagItems };
      
      if (quantity <= 0) {
        delete newBagItems[productId];
        await supabase
          .from("current_bag")
          .delete()
          .eq("user_id", user?.id)
          .eq("product_id", productId);
      } else {
        newBagItems[productId] = quantity;
        await supabase
          .from("current_bag")
          .upsert({
            user_id: user?.id,
            product_id: productId,
            quantity
          });
      }

      setBagItems(newBagItems);
    } catch (error) {
      console.error("Error updating bag:", error);
      toast({
        title: "Error",
        description: "Failed to update bag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (orderItems: OrderItem[]) => {
    try {
      const reorderPromises = orderItems.map(item =>
        supabase
          .from("current_bag")
          .upsert({
            user_id: user?.id,
            product_id: item.product_id,
            quantity: item.quantity
          })
      );

      await Promise.all(reorderPromises);
      await fetchBagItems();

      toast({
        title: "Success",
        description: "Items added to your bag!",
      });
    } catch (error) {
      console.error("Error reordering:", error);
      toast({
        title: "Error",
        description: "Failed to add items to bag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, price")
        .in("id", Object.keys(bagItems));

      if (!products) return;

      const totalAmount = products.reduce((sum, product) => {
        const quantity = bagItems[product.id];
        return sum + (product.price * quantity);
      }, 0) + 4.99; // Add delivery fee

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id,
          total_amount: totalAmount,
          order_type: isSubscription ? "subscription" : "one-time",
          status: "pending"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsData = products.map(product => ({
        order_id: order.id,
        product_id: product.id,
        quantity: bagItems[product.id],
        price: product.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // Clear the bag
      await supabase
        .from("current_bag")
        .delete()
        .eq("user_id", user?.id);

      setBagItems({});

      toast({
        title: "Order Confirmed!",
        description: isSubscription ? "This week's box has been confirmed." : "Your order has been placed.",
      });
    } catch (error) {
      console.error("Error confirming order:", error);
      toast({
        title: "Error",
        description: "Failed to confirm order. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Bag Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">My Bag</h1>
                <p className="text-muted-foreground">
                  {isSubscription 
                    ? `${Object.values(bagItems).reduce((sum, quantity) => sum + quantity, 0)} items for this week's delivery`
                    : "Build your custom order"
                  }
                </p>
              </div>
            </div>

            {/* Subscription Status Banner for One-time Users */}
            {!isSubscription && Object.keys(bagItems).length === 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">Ready to order again?</h3>
                      <p className="text-sm text-muted-foreground">
                        Add products below to create your next order
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Previous Orders Section */}
            {isSubscription && (
              <PreviousOrders onReorder={handleReorder} />
            )}

            {/* Current Bag Items Display */}
            {Object.keys(bagItems).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Items in Your Bag</h2>
                <BagItemsList bagItems={bagItems} onUpdateQuantity={updateBagQuantity} />
              </div>
            )}

            {/* Product Selection Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {Object.keys(bagItems).length > 0 ? "Add More Products" : "Available Products"}
              </h2>
              <ProductGrid 
                bagItems={bagItems} 
                onUpdateQuantity={updateBagQuantity} 
              />
            </div>

            {Object.keys(bagItems).length === 0 && !isSubscription && (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your bag is empty</h3>
                  <p className="text-muted-foreground mb-6">Add some fresh items to get started</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Summary */}
          <div className="space-y-6">
            <BagSummary 
              bagItems={bagItems}
              isSubscription={isSubscription}
              onConfirmOrder={handleConfirmOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyBag;