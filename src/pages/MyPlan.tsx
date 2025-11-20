
import { useState, useEffect, useRef } from "react";
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
import { EditableDeliveryForm } from "@/components/EditableDeliveryForm";
import NotificationPreferences from "@/components/NotificationPreferences";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";



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
  box_sizes?: {
    display_name: string;
    base_price: number;
    subscriber_price?: number;
  };
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
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [isPasswordResetFlow, setIsPasswordResetFlow] = useState(false);
  const passwordSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('password_reset') === 'true') {
      setShowPasswordResetModal(true);
      setIsPasswordResetFlow(true);
      window.history.replaceState({}, '', '/my-plan');
    }
  }, []);

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

      // Load recent order data first to get current subscription info
      const { data: recentOrderData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .eq('payment_status', 'paid')
        .order('order_date', { ascending: false })
        .limit(1)
        .single();

      // If we have a recent paid order use it for plan summary (regardless of subscription status)
      if (recentOrderData) {
        // Fetch box_sizes data separately
        const { data: boxSizeData } = await supabase
          .from('box_sizes')
          .select('display_name, base_price, subscriber_price')
          .eq('name', recentOrderData.box_size)
          .single();

        // Determine if this was a subscription at purchase time
        const wasSubscriptionAtPurchase = recentOrderData.order_type === 'subscription';
        
        // Transform order data to match WeeklyBag interface for display
        const orderAsWeeklyBag = {
          ...recentOrderData,
          subtotal: recentOrderData.box_price + (recentOrderData.addons_total || 0),
          delivery_fee: recentOrderData.delivery_fee || 9.00,
          total_amount: recentOrderData.total_amount ?? (recentOrderData.box_price + (recentOrderData.addons_total || 0) + (recentOrderData.delivery_fee || 9.00)),
          addons_total: recentOrderData.addons_total || 0,
          is_confirmed: true,
          box_price: recentOrderData.box_price,
          from_recent_order: true,
          order_type: recentOrderData.order_type,
          box_sizes: boxSizeData ? {
            ...boxSizeData
          } : null
        };
        setWeeklyBag(orderAsWeeklyBag as any);
      } else {
        // Fallback to weekly bag data
        const { data: bagData } = await supabase
          .from('weekly_bags')
          .select(`
            *,
            box_sizes!inner(
              display_name,
              base_price,
              subscriber_price
            )
          `)
          .eq('user_id', user?.id)
          .gte('week_end_date', new Date().toISOString().split('T')[0])
          .order('week_start_date', { ascending: true })
          .limit(1)
          .single();
        
        if (bagData) {
          setWeeklyBag(bagData);
        }
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


    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleAddressUpdate = (updatedAddress: DeliveryAddress) => {
    setDeliveryAddress(updatedAddress);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      // Skip re-authentication if coming from password reset flow
      if (!isPasswordResetFlow) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: currentPassword,
        });

        if (signInError) {
          toast({
            title: "Error",
            description: "Current password is incorrect",
            variant: "destructive",
          });
          return;
        }
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Your password has been changed successfully",
      });

      // Clear form and reset flow
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsPasswordResetFlow(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
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
      <AlertDialog open={showPasswordResetModal} onOpenChange={setShowPasswordResetModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Reset Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              Your password has been successfully reset. You're now logged into your account.
              You can optionally update your password again from the settings below if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowPasswordResetModal(false);
                setTimeout(() => {
                  passwordSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }}
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              boxSize={weeklyBag?.box_size || undefined}
            />



            {/* Delivery Information */}
            <EditableDeliveryForm 
              address={deliveryAddress}
              onAddressUpdate={handleAddressUpdate}
            />

            {/* Notification Preferences */}
            <NotificationPreferences />

            {/* Change Password */}
            <Card ref={passwordSectionRef}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </div>
                  {isPasswordResetFlow && (
                    <Badge variant="secondary">Password Reset Mode</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {!isPasswordResetFlow && (
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={isChangingPassword}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isChangingPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isChangingPassword}
                    />
                  </div>
                  <Button type="submit" disabled={isChangingPassword} className="w-full">
                    {isChangingPassword ? "Changing Password..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

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
                    <span>{(() => {
                      const baseName = weeklyBag?.box_sizes?.display_name || 'Farm Box';
                      const isOrder = (weeklyBag as any)?.from_recent_order;
                      const orderType = (weeklyBag as any)?.order_type;
                      const suffix = isOrder
                        ? (orderType === 'subscription' ? ' Subscription' : ' One-Time Purchase')
                        : (subscription?.status === 'active' ? ' Subscription' : ' One-Time Purchase');
                      return baseName + suffix;
                    })()}</span>
                    <span>${(() => {
                      const isOrder = (weeklyBag as any)?.from_recent_order;
                      if (isOrder) {
                        return (weeklyBag?.box_price ?? 0).toFixed(2);
                      }
                      if (!weeklyBag?.box_sizes) return '34.99';
                      const isActiveSubscription = subscription?.status === 'active';
                      const price = isActiveSubscription 
                        ? (weeklyBag.box_sizes.subscriber_price || weeklyBag.box_sizes.base_price)
                        : weeklyBag.box_sizes.base_price;
                      return price.toFixed(2);
                    })()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>Fresh seasonal produce</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(() => {
                      const isOrder = (weeklyBag as any)?.from_recent_order;
                      if (isOrder) {
                        const boxPrice = weeklyBag?.box_price ?? 0;
                        const addons = weeklyBag?.addons_total ?? 0;
                        return (boxPrice + addons).toFixed(2);
                      }
                      if (!weeklyBag?.box_sizes) return '34.99';
                      const isActiveSubscription = subscription?.status === 'active';
                      const boxPrice = isActiveSubscription 
                        ? (weeklyBag.box_sizes.subscriber_price || weeklyBag.box_sizes.base_price)
                        : weeklyBag.box_sizes.base_price;
                      const subtotal = boxPrice + (weeklyBag.addons_total || 0);
                      return subtotal.toFixed(2);
                    })()}</span>
                  </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>${(() => {
                        const isOrder = (weeklyBag as any)?.from_recent_order;
                        if (isOrder) {
                          return (weeklyBag?.delivery_fee ?? 9.00).toFixed(2);
                        }
                        return '9.00';
                      })()}</span>
                    </div>
                </div>

                <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>Weekly Total</span>
                    <span>${(() => {
                      const isOrder = (weeklyBag as any)?.from_recent_order;
                      if (isOrder) {
                        const total = weeklyBag?.total_amount 
                          ?? ((weeklyBag?.box_price ?? 0) + (weeklyBag?.addons_total ?? 0) + (weeklyBag?.delivery_fee ?? 9.00));
                        return total.toFixed(2);
                      }
                      if (!weeklyBag?.box_sizes) return '39.98';
                      const isActiveSubscription = subscription?.status === 'active';
                      const boxPrice = isActiveSubscription 
                        ? (weeklyBag.box_sizes.subscriber_price || weeklyBag.box_sizes.base_price)
                        : weeklyBag.box_sizes.base_price;
                      const total = boxPrice + (weeklyBag.addons_total || 0) + 9.00; // 9.00 delivery fee
                      return total.toFixed(2);
                    })()}</span>
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
