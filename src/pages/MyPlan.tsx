import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Leaf, Package, MapPin, CreditCard, Calendar, Settings, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UserPreferences {
  organic: boolean;
  no_fish: boolean;
  local_only: boolean;
  vegetarian: boolean;
  gluten_free: boolean;
  boxes_per_week: number;
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
    boxes_per_week: 1
  });
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
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
          boxes_per_week: prefsData.boxes_per_week
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
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (subData) {
        setSubscription(subData);
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
          boxes_per_week: preferences.boxes_per_week
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

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800 border-green-200",
      paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      suspended: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.suspended}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-primary" />
                    <span>Subscription Status</span>
                  </div>
                  {subscription && getStatusBadge(subscription.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Plan Type</Label>
                      <p className="text-sm text-muted-foreground">{subscription.subscription_type} delivery</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Member Since</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(subscription.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {subscription.status === 'paused' && subscription.auto_resume_date && (
                      <div className="col-span-2">
                        <Label className="text-sm font-medium">Auto-Resume Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(subscription.auto_resume_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active subscription found</p>
                )}
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Delivery Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliveryAddress ? (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-muted-foreground">
                        {deliveryAddress.street_address}
                        {deliveryAddress.apartment && `, ${deliveryAddress.apartment}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zip_code}
                      </p>
                    </div>
                    {deliveryAddress.delivery_instructions && (
                      <div>
                        <Label className="text-sm font-medium">Delivery Instructions</Label>
                        <p className="text-sm text-muted-foreground">
                          {deliveryAddress.delivery_instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No delivery address on file</p>
                )}
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

            {/* Delivery Frequency */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Frequency</CardTitle>
                <CardDescription>How many boxes would you like per week?</CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={preferences.boxes_per_week.toString()} 
                  onValueChange={(value) => setPreferences({...preferences, boxes_per_week: parseInt(value)})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select boxes per week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 box per week</SelectItem>
                    <SelectItem value="2">2 boxes per week</SelectItem>
                    <SelectItem value="3">3 boxes per week</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Summary & Actions */}
          <div className="space-y-6">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Farm Box</span>
                    <span>$45.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>8-10 items</span>
                    <span>x{preferences.boxes_per_week}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(45 * preferences.boxes_per_week).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>$4.99</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Weekly Total</span>
                  <span>${(45 * preferences.boxes_per_week + 4.99).toFixed(2)}</span>
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
            <Card>
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
              <Card>
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