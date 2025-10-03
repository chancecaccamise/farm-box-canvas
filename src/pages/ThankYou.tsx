import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, MapPin, Calendar, Clock, Receipt, DollarSign, Truck, ArrowRight, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface OrderData {
  id: string;
  order_date: string;
  total_amount: number;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  shipping_address_street: string;
  shipping_address_apartment?: string;
  shipping_address_city: string;
  shipping_address_state: string;
  shipping_address_zip: string;
  delivery_instructions?: string;
  box_size: string;
  box_price: number;
  addons_total: number;
  delivery_fee: number;
  order_confirmation_number: string;
  week_start_date?: string;
  delivery_time_preference?: string;
  delivery_day_preference?: string;
  user_protein_selections?: string[];
  user_carb_selections?: string[];
  user_full_farm_bag_protein?: string;
  user_full_farm_bag_carb?: string;
  order_items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    item_type: string;
  }>;
}

const ThankYou = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
          toast({
            title: "Missing session information",
            description: "Redirecting to your orders...",
            variant: "default",
          });
          setTimeout(() => navigate('/my-bag'), 2000);
          setLoading(false);
          return;
        }

        // Fetch order details using session ID
        const { data: orderDetails, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              id,
              product_name,
              quantity,
              price,
              item_type
            )
          `)
          .eq("stripe_session_id", sessionId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching order:", error);
          toast({
            title: "Unable to load order details",
            description: "Please check your email for order confirmation.",
            variant: "destructive",
          });
        } else if (orderDetails) {
          // If user is authenticated, verify it's their order
          if (user && orderDetails.user_id !== user.id) {
            setOrderData(null);
            setLoading(false);
            return;
          }

          setOrderData(orderDetails as OrderData);
          
          // Fetch product names for all UUIDs in the order
          const productIds = new Set<string>();
          if (orderDetails.user_full_farm_bag_protein) productIds.add(orderDetails.user_full_farm_bag_protein);
          if (orderDetails.user_full_farm_bag_carb) productIds.add(orderDetails.user_full_farm_bag_carb);
          orderDetails.user_protein_selections?.forEach((id: string) => productIds.add(id));
          orderDetails.user_carb_selections?.forEach((id: string) => productIds.add(id));
          
          if (productIds.size > 0) {
            const { data: products } = await supabase
              .from('products')
              .select('id, name')
              .in('id', Array.from(productIds));
            
            const nameMap: Record<string, string> = {};
            products?.forEach(product => nameMap[product.id] = product.name);
            setProductNames(nameMap);
          }
        } else {
          toast({
            title: "Order not found",
            description: "Your order may still be processing.",
          });
        }
      } catch (error) {
        console.error("Error loading order details:", error);
        toast({
          title: "Error loading order",
          description: "Please check your email for confirmation.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [searchParams, user, toast, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        {/* Main Message */}
        <h1 className="text-4xl font-bold mb-4">Thank You for Your Order!</h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-lg mx-auto">
          {orderData ? 
            orderData.delivery_time_preference === 'delivery' ? 
              `Your order has been confirmed and will be delivered to your address.` :
              `Your order has been confirmed and will be ready for pickup.` :
            'Your payment has been processed successfully! Your order details are being finalized.'
          }
        </p>

        {!orderData && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-lg mx-auto">
            <p className="text-sm text-red-800">
              ⚠️ We're having trouble loading your order details. Please check your email for confirmation or contact support.
            </p>
          </div>
        )}

        {/* Order Details Card */}
        <Card className="mb-8 shadow-medium text-left">
          <CardHeader>
            <CardTitle>Order Confirmation</CardTitle>
            <CardDescription>
              {orderData ? `Order #${orderData.order_confirmation_number || orderData.id.slice(0, 8)}` : 'Order details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ) : orderData ? (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        {orderData.delivery_time_preference === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {orderData.delivery_time_preference === 'delivery' ? (
                          <>
                            {orderData.shipping_address_street}
                            {orderData.shipping_address_apartment && `, ${orderData.shipping_address_apartment}`}<br />
                            {orderData.shipping_address_city}, {orderData.shipping_address_state} {orderData.shipping_address_zip}
                          </>
                        ) : orderData.delivery_time_preference === 'market-pickup' ? (
                          <>
                            Farmers Market<br />
                            Check your email for exact location details
                          </>
                        ) : (
                          <>
                            Billy's Farm<br />
                            Check your email for exact location details
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        {orderData.delivery_time_preference === 'delivery' ? 'Delivery Window' : 'Pickup Schedule'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {orderData.delivery_time_preference === 'delivery' ? (
                          <>
                            {orderData.week_start_date ? 
                              `Week of ${new Date(orderData.week_start_date).toLocaleDateString()}` : 
                              'Next available delivery window'
                            }<br />
                            Between 8 AM - 12 PM
                          </>
                        ) : (
                          <>
                            {orderData.delivery_day_preference || 'Check your email for pickup day'}<br />
                            {orderData.delivery_time_preference === 'market-pickup' ? 
                              'Market hours: 8 AM - 2 PM' : 
                              'Farm hours: 9 AM - 5 PM'
                            }
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">📦 Your Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    {orderData.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                      <span>Total</span>
                      <span>${orderData.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* User Selections */}
                {(orderData.user_full_farm_bag_protein || orderData.user_full_farm_bag_carb || 
                  (orderData.user_protein_selections && orderData.user_protein_selections.length > 0) ||
                  (orderData.user_carb_selections && orderData.user_carb_selections.length > 0)) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">✨ Your Selections</h4>
                    <div className="text-sm space-y-1">
                      {orderData.user_full_farm_bag_protein && (
                        <p><strong>Selected Protein:</strong> {productNames[orderData.user_full_farm_bag_protein] || 'Loading...'}</p>
                      )}
                      {orderData.user_full_farm_bag_carb && (
                        <p><strong>Selected Carb:</strong> {productNames[orderData.user_full_farm_bag_carb] || 'Loading...'}</p>
                      )}
                      {orderData.user_protein_selections && orderData.user_protein_selections.length > 0 && (
                        <p><strong>Protein Selections:</strong> {orderData.user_protein_selections.map(id => productNames[id] || 'Loading...').join(', ')}</p>
                      )}
                      {orderData.user_carb_selections && orderData.user_carb_selections.length > 0 && (
                        <p><strong>Carb Selections:</strong> {orderData.user_carb_selections.map(id => productNames[id] || 'Loading...').join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                {orderData.delivery_instructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">📝 Delivery Instructions</h4>
                    <p className="text-sm text-blue-800">{orderData.delivery_instructions}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  {loading ? 'Loading order details...' : 'Your order is being processed. You will receive an email confirmation shortly.'}
                </p>
                {!loading && !user && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to view full order details.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-8 shadow-soft">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">What's Next?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">1</div>
                <p className="font-medium">We Pack Your Box</p>
                <p className="text-muted-foreground">
                  {orderData?.delivery_time_preference === 'delivery' ? 
                    'Fresh from the farm the night before delivery' :
                    'Fresh from the farm ready for pickup'
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">2</div>
                <p className="font-medium">
                  {orderData?.delivery_time_preference === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup'}
                </p>
                <p className="text-muted-foreground">
                  {orderData?.delivery_time_preference === 'delivery' ? 
                    "You'll get a text when it's on the way" :
                    "We'll notify you when your order is ready"
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">3</div>
                <p className="font-medium">Enjoy Fresh Food</p>
                <p className="text-muted-foreground">Unpack and start cooking amazing meals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" onClick={() => navigate('/my-bag')}>
            <Home className="w-4 h-4 mr-2" />
            Manage Your Bag
          </Button>
          
          <Button variant="outline" size="lg" asChild>
            <Link to="/">
              Return to Home
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground mt-4">
            Loading your order details...
          </div>
        )}

      </div>
    </div>
  );
};

export default ThankYou;