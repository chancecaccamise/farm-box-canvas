
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { BoxSizeSelector } from "@/components/BoxSizeSelector";
import { EditableDeliveryForm } from "@/components/EditableDeliveryForm";
import { ContactForm } from "@/components/ContactForm";


interface DeliveryAddress {
  id: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  zip_code: string;
  is_primary: boolean;
  delivery_instructions?: string;
}

interface SubscriptionInfo {
  id: string;
  status: string;
  subscription_type: string;
  created_at: string;
  paused_at?: string;
  cancelled_at?: string;
  auto_resume_date?: string;
  pause_reason?: string;
  cancellation_reason?: string;
}

interface WeeklyBag {
  id: string;
  box_size: string;
  box_price: number;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  addons_total: number;
  is_confirmed: boolean;
}

const MyPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [weeklyBag, setWeeklyBag] = useState<WeeklyBag | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [nextDeliveryDate, setNextDeliveryDate] = useState<string>("");
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      

      // Load delivery address
      const { data: addressData } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_primary', true)
        .single();
      
      if (addressData) {
        setDeliveryAddress(addressData);
      }

      // Load subscription info
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (subData && !subError) {
        setSubscription(subData);
      }

      // Load current weekly bag
      const { data: bagData } = await supabase
        .from('weekly_bags')
        .select('*')
        .eq('user_id', user?.id)
        .gte('week_end_date', new Date().toISOString().split('T')[0])
        .order('week_start_date', { ascending: true })
        .limit(1)
        .single();
      
      if (bagData) {
        setWeeklyBag(bagData);
      }

      // Load recent order history
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, order_date, total_amount, status')
        .eq('user_id', user?.id)
        .order('order_date', { ascending: false })
        .limit(5);
      
      if (ordersData) {
        setOrderHistory(ordersData);
      }

      // Calculate next delivery date (next Friday)
      const today = new Date();
      const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
      const nextFriday = new Date(today);
      nextFriday.setDate(today.getDate() + daysUntilFriday);
      setNextDeliveryDate(nextFriday.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleBoxSizeChange = (newBoxSize: string, newPrice: number) => {
    // Update the weekly bag state with new pricing
    if (weeklyBag) {
      setWeeklyBag({
        ...weeklyBag,
        box_size: newBoxSize,
        box_price: newPrice,
        subtotal: newPrice + (weeklyBag.addons_total || 0),
        total_amount: newPrice + (weeklyBag.addons_total || 0) + weeklyBag.delivery_fee
      });
    }
  };

  const handleAddressUpdate = (updatedAddress: DeliveryAddress) => {
    setDeliveryAddress(updatedAddress);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-muted rounded"></div>
                ))}
              </div>
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
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
          {/* Left Side - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Plan</h1>
                <p className="text-muted-foreground">Manage your subscription and preferences</p>
              </div>
              <Button onClick={() => navigate('/my-bag')} variant="outline">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Manage Bag
              </Button>
            </div>

            {/* Subscription Status */}
            <SubscriptionManager 
              subscription={subscription} 
              onSubscriptionUpdate={loadUserData}
            />

            {/* Box Size Selection */}
            <BoxSizeSelector 
              currentBoxSize={weeklyBag?.box_size || "medium"}
              onBoxSizeChange={handleBoxSizeChange}
              isConfirmed={weeklyBag?.is_confirmed || false}
            />

            {/* Delivery Information */}
            <EditableDeliveryForm 
              address={deliveryAddress}
              onAddressUpdate={handleAddressUpdate}
            />

            {/* Next Delivery Info */}
            <Card>
              <CardContent className="pt-6">
                <div>
                  <Label className="text-sm font-medium">Next Delivery</Label>
                  <p className="text-sm text-muted-foreground">{nextDeliveryDate}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <ContactForm />
          </div>

          {/* Right Side - Summary & Actions */}
          <div className="space-y-6">
            {/* Plan Summary */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Plan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{weeklyBag?.box_size ? `${weeklyBag.box_size.charAt(0).toUpperCase() + weeklyBag.box_size.slice(1)} Box` : 'Farm Box'}</span>
                    <span>${weeklyBag?.box_price?.toFixed(2) || '34.99'}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>Fresh seasonal produce</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${weeklyBag?.subtotal?.toFixed(2) || weeklyBag?.box_price?.toFixed(2) || '34.99'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${weeklyBag?.delivery_fee?.toFixed(2) || '4.99'}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Weekly Total</span>
                  <span>${weeklyBag?.total_amount?.toFixed(2) || '39.98'}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promo">Promo Code</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="promo"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Recent Orders */}
            {orderHistory.length > 0 && (
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Recent Orders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderHistory.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">
                            {new Date(order.order_date).toLocaleDateString()}
                          </p>
                          <p className="text-muted-foreground">{order.status}</p>
                        </div>
                        <p className="font-medium">${order.total_amount}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/account')}>
                    View All Orders
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPlan;
