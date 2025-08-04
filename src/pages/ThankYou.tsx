import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Truck, ArrowRight, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ThankYou = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderDetails = async (attempt = 1) => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          console.log('No session_id found in URL');
          toast({
            title: "Missing session information",
            description: "Redirecting to your bag...",
            variant: "default",
          });
          setTimeout(() => navigate('/my-bag'), 2000);
          setLoading(false);
          return;
        }

        console.log(`Loading order details for session: ${sessionId} (attempt ${attempt})`);

        // Try to fetch order details using just session ID first (for unauthenticated users)
        const { data: order, error } = await supabase
          .from('orders')
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
          .eq('stripe_session_id', sessionId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching order:', error);
          if (attempt <= 3) {
            console.log(`Retrying in ${attempt * 2} seconds...`);
            setTimeout(() => loadOrderDetails(attempt + 1), attempt * 2000);
            return;
          }
          toast({
            title: "Unable to load order details",
            description: "Please check your email for order confirmation or contact support.",
            variant: "destructive",
          });
        } else if (order) {
          // If user is authenticated, verify it's their order
          if (user && order.user_id !== user.id) {
            console.log('Order belongs to different user');
            setOrderDetails(null);
            setLoading(false);
            return;
          }

          // If order is still pending payment, try to verify payment directly with Stripe
          if (order.payment_status === 'pending' && attempt <= 2) {
            console.log('Order payment pending, attempting direct verification...');
            try {
              const { data: verificationResult } = await supabase.functions.invoke('verify-payment', {
                body: { sessionId }
              });

              if (verificationResult?.success && verificationResult?.order) {
                console.log('Payment verified successfully via fallback');
                setOrderDetails(verificationResult.order);
                setLoading(false);
                return;
              } else if (verificationResult?.payment_status && verificationResult.payment_status !== 'paid') {
                console.log('Payment status from verification:', verificationResult.payment_status);
                // Show the order with current status for transparency
                setOrderDetails(order);
                setLoading(false);
                return;
              }
            } catch (verifyError) {
              console.warn('Payment verification failed, showing order as is:', verifyError);
            }
          }

          if (order.payment_status === 'pending' && attempt <= 2) {
            console.log(`Order still pending payment, retrying in ${attempt * 2} seconds...`);
            setTimeout(() => loadOrderDetails(attempt + 1), attempt * 2000);
            return;
          }

          // Show order even if payment is still pending after brief retry
          if (order.payment_status === 'pending') {
            console.log('Showing order despite pending payment status - webhook may be delayed');
          }

          console.log('Order details loaded successfully');
          setOrderDetails(order);
        } else {
          // If order not found and we haven't tried many times, retry
          if (attempt <= 3) {
            console.log(`Order not found, retrying in ${attempt * 2} seconds...`);
            setTimeout(() => loadOrderDetails(attempt + 1), attempt * 2000);
            return;
          }
          
          console.log('No order found for session ID after retries');
          toast({
            title: "Order not found",
            description: "Your order may still be processing. Redirecting to your bag...",
          });
          setTimeout(() => navigate('/my-bag'), 3000);
        }
      } catch (error) {
        console.error('Error loading order details:', error);
        if (attempt <= 3) {
          setTimeout(() => loadOrderDetails(attempt + 1), attempt * 2000);
          return;
        }
        toast({
          title: "Error loading order",
          description: "Redirecting to your bag. Check your email for confirmation.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/my-bag'), 3000);
      } finally {
        if (attempt > 3 || orderDetails) {
          setLoading(false);
        }
      }
    };

    loadOrderDetails();
  }, [user, toast]);

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
          {orderDetails ? 
            orderDetails.has_active_subscription ? 
              `Your add-ons have been ${orderDetails.payment_status === 'paid' ? 'confirmed' : 'received'} and will be delivered with your weekly subscription box to ${orderDetails.shipping_address_street || 'your address'}.` :
              `Your order has been ${orderDetails.payment_status === 'paid' ? 'confirmed' : 'received'} and will be delivered to ${orderDetails.shipping_address_street || 'your address'}.` :
            'Your payment has been processed successfully! Your order details are being finalized.'
          }
        </p>

        {orderDetails && orderDetails.payment_status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-lg mx-auto">
            <p className="text-sm text-yellow-800">
              🔄 Your payment is being processed. Your order will be confirmed shortly! If this persists, please contact support.
            </p>
          </div>
        )}

        {!orderDetails && !loading && (
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
              {orderDetails ? `Order #${orderDetails.id.slice(0, 8)}` : 'Order details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ) : orderDetails ? (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Delivery Address</h3>
                      <p className="text-sm text-muted-foreground">
                        {orderDetails.shipping_address_street}
                        {orderDetails.shipping_address_apartment && `, ${orderDetails.shipping_address_apartment}`}<br />
                        {orderDetails.shipping_address_city}, {orderDetails.shipping_address_state} {orderDetails.shipping_address_zip}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Delivery Window</h3>
                      <p className="text-sm text-muted-foreground">
                        {orderDetails.week_start_date ? 
                          `Week of ${new Date(orderDetails.week_start_date).toLocaleDateString()}` : 
                          'Next available delivery window'
                        }<br />
                        Between 8 AM - 12 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">📦 Your Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    {orderDetails.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                      <span>Total</span>
                      <span>${orderDetails.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {orderDetails.delivery_instructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">📝 Delivery Instructions</h4>
                    <p className="text-sm text-blue-800">{orderDetails.delivery_instructions}</p>
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
                <p className="text-muted-foreground">Fresh from the farm the night before delivery</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">2</div>
                <p className="font-medium">Out for Delivery</p>
                <p className="text-muted-foreground">You'll get a text when it's on the way</p>
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

        <p className="text-sm text-muted-foreground mt-8">
          Questions? Contact our team at hello@farmbox.com or (555) 123-4567
        </p>
      </div>
    </div>
  );
};

export default ThankYou;