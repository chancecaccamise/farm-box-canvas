import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

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

interface Order {
  id: string;
  order_date: string;
  total_amount: number;
  status: string;
  order_items: OrderItem[];
}

interface PreviousOrdersProps {
  onReorder: (items: OrderItem[]) => void;
}

export function PreviousOrders({ onReorder }: PreviousOrdersProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreviousOrders();
    }
  }, [user]);

  const fetchPreviousOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_date,
          total_amount,
          status,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              name,
              image
            )
          )
        `)
        .eq("user_id", user?.id)
        .order("order_date", { ascending: false })
        .limit(3);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching previous orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Previous Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No Previous Orders</h3>
          <p className="text-muted-foreground">Start building your first bag below!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Previous Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.order_date).toLocaleDateString()}
                </span>
                <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                  {order.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {order.order_items.length} items
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <DollarSign className="h-3 w-3" />
                  {order.total_amount}
                </span>
              </div>
              
              <div className="space-y-1">
                {order.order_items.slice(0, 2).map((item) => (
                  <div key={item.id} className="text-xs text-muted-foreground">
                    {item.quantity}x {item.products.name}
                  </div>
                ))}
                {order.order_items.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{order.order_items.length - 2} more items
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onReorder(order.order_items)}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Reorder
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}