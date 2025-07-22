
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Leaf, Calendar, Settings, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { BoxSizeSelector } from "@/components/BoxSizeSelector";
import { EditableDeliveryForm } from "@/components/EditableDeliveryForm";

interface UserPreferences {
  organic: boolean;
  no_fish: boolean;
  local_only: boolean;
  vegetarian: boolean;
  gluten_free: boolean;
}

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
}

const MyPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    organic: false,
    no_fish: false,
    local_only: false,
    vegetarian: false,
    gluten_free: false,
  });
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [weeklyBag, setWeeklyBag] = useState<WeeklyBag | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      
      // Load user preferences
      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (prefsData) {
        setPreferences({
          organic: prefsData.organic,
          no_fish: prefsData.no_fish,
          local_only: prefsData.local_only,
          vegetarian: prefsData.vegetarian,
          gluten_free: prefsData.gluten_free,
        });
      }

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

  const savePreferences = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          organic: preferences.organic,
          no_fish: preferences.no_fish,
          local_only: preferences.local_only,
          vegetarian: preferences.vegetarian,
          gluten_free: preferences.gluten_free,
        });
      
      if (error) throw error;
      
      toast({
        title: "Preferences Saved",
        description: "Your dietary preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

            {/* Dietary Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="w-5 h-5 text-accent" />
                  <span>Dietary Preferences</span>
                </CardTitle>
                <CardDescription>
                  Customize your weekly selections based on your dietary needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="organic">Organic Only</Label>
                    <p className="text-sm text-muted-foreground">Only certified organic produce</p>
                  </div>
                  <Switch 
                    id="organic"
                    checked={preferences.organic}
                    onCheckedChange={(checked) => setPreferences({...preferences, organic: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="no-fish">No Fish</Label>
                    <p className="text-sm text-muted-foreground">Exclude all fish and seafood</p>
                  </div>
                  <Switch 
                    id="no-fish"
                    checked={preferences.no_fish}
                    onCheckedChange={(checked) => setPreferences({...preferences, no_fish: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="local-only">Local Only</Label>
                    <p className="text-sm text-muted-foreground">Products sourced within 100 miles</p>
                  </div>
                  <Switch 
                    id="local-only"
                    checked={preferences.local_only}
                    onCheckedChange={(checked) => setPreferences({...preferences, local_only: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vegetarian">Vegetarian</Label>
                    <p className="text-sm text-muted-foreground">No meat or fish products</p>
                  </div>
                  <Switch 
                    id="vegetarian"
                    checked={preferences.vegetarian}
                    onCheckedChange={(checked) => setPreferences({...preferences, vegetarian: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gluten-free">Gluten Free</Label>
                    <p className="text-sm text-muted-foreground">No gluten-containing products</p>
                  </div>
                  <Switch 
                    id="gluten-free"
                    checked={preferences.gluten_free}
                    onCheckedChange={(checked) => setPreferences({...preferences, gluten_free: checked})}
                  />
                </div>

                <Button onClick={savePreferences} disabled={saving} className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
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

            {/* Active Preferences */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Active Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {preferences.organic && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Organic Only</span>
                    </div>
                  )}
                  {preferences.local_only && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Local Only</span>
                    </div>
                  )}
                  {preferences.no_fish && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>No Fish</span>
                    </div>
                  )}
                  {preferences.vegetarian && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Vegetarian</span>
                    </div>
                  )}
                  {preferences.gluten_free && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Gluten Free</span>
                    </div>
                  )}
                  {!preferences.organic && !preferences.local_only && !preferences.no_fish && 
                   !preferences.vegetarian && !preferences.gluten_free && (
                    <p className="text-sm text-muted-foreground">No dietary restrictions</p>
                  )}
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
