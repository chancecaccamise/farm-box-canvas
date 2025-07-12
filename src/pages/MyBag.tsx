import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, AlertCircle, Package } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { CountdownTimer } from "@/components/CountdownTimer";
import { BagHistory } from "@/components/BagHistory";
import { WeeklyBagSummary } from "@/components/WeeklyBagSummary";
import { ProductGrid } from "@/components/ProductGrid";
import { EmptyBagState } from "@/components/EmptyBagState";
import { BagItemCard } from "@/components/BagItemCard";
import { ProductCard } from "@/components/ProductCard";
import { SubscriptionManager } from "@/components/SubscriptionManager";

interface WeeklyBag {
  id: string;
  week_start_date: string;
  week_end_date: string;
  cutoff_time: string;
  is_confirmed: boolean;
  confirmed_at: string | null;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
}

interface WeeklyBagItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  products: {
    name: string;
    price: number;
    category: string;
    image: string;
  };
}

function MyBag() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentWeekBag, setCurrentWeekBag] = useState<WeeklyBag | null>(null);
  const [bagItems, setBagItems] = useState<WeeklyBagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkSubscriptionAndInitialize();
    }
  }, [user]);

  const checkSubscriptionAndInitialize = async () => {
    try {
      // Check if user has an active subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (subError && subError.code !== "PGRST116") {
        throw subError;
      }

      const hasSubscription = !!subscriptionData;
      const isActiveSubscription = subscriptionData?.status === 'active';
      setSubscription(subscriptionData);
      setHasActiveSubscription(isActiveSubscription);

      if (isActiveSubscription) {
        await initializeCurrentWeekBag();
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentWeekBag) {
      checkIfLocked();
      const interval = setInterval(checkIfLocked, 1000);
      return () => clearInterval(interval);
    }
  }, [currentWeekBag]);

  const initializeCurrentWeekBag = async () => {
    try {
      // Get or create current week bag using the database function
      const { data: bagIdData, error: bagError } = await supabase
        .rpc('get_or_create_current_week_bag', { user_uuid: user?.id });

      if (bagError) {
        console.error("Database function error:", bagError);
        throw bagError;
      }

      // Fetch the bag details
      const { data: bagData, error: fetchError } = await supabase
        .from("weekly_bags")
        .select("*")
        .eq("id", bagIdData)
        .single();

      if (fetchError) throw fetchError;

      setCurrentWeekBag(bagData);
      await fetchBagItems(bagData.id);
    } catch (error) {
      console.error("Error initializing weekly bag:", error);
      toast({
        title: "Error",
        description: "Failed to load your bag. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const fetchBagItems = async (bagId: string) => {
    try {
      const { data, error } = await supabase
        .from("weekly_bag_items")
        .select(`
          id,
          product_id,
          quantity,
          price_at_time,
          products (
            name,
            price,
            category,
            image
          )
        `)
        .eq("weekly_bag_id", bagId);

      if (error) throw error;
      setBagItems(data || []);
    } catch (error) {
      console.error("Error fetching bag items:", error);
    }
  };

  const checkIfLocked = () => {
    if (!currentWeekBag) return;
    const now = new Date();
    const cutoff = new Date(currentWeekBag.cutoff_time);
    setIsLocked(now > cutoff);
  };

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    if (!currentWeekBag || currentWeekBag.is_confirmed || isLocked) {
      toast({
        title: "Cannot Modify",
        description: "Your bag is locked and cannot be modified.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (newQuantity <= 0) {
        // Remove item
        await supabase
          .from("weekly_bag_items")
          .delete()
          .eq("weekly_bag_id", currentWeekBag.id)
          .eq("product_id", productId);
      } else {
        // Get current product price
        const { data: productData } = await supabase
          .from("products")
          .select("price")
          .eq("id", productId)
          .single();

        if (!productData) return;

        // Upsert item
        await supabase
          .from("weekly_bag_items")
          .upsert({
            weekly_bag_id: currentWeekBag.id,
            product_id: productId,
            quantity: newQuantity,
            price_at_time: productData.price
          });
      }

      await fetchBagItems(currentWeekBag.id);
      await updateBagTotals();
    } catch (error) {
      console.error("Error updating item quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateBagTotals = async () => {
    if (!currentWeekBag) return;

    try {
      const { data, error } = await supabase
        .from("weekly_bag_items")
        .select("quantity, price_at_time")
        .eq("weekly_bag_id", currentWeekBag.id);

      if (error) throw error;

      const subtotal = data.reduce((sum, item) => sum + (item.quantity * item.price_at_time), 0);
      const deliveryFee = currentWeekBag.delivery_fee;
      const total = subtotal + deliveryFee;

      await supabase
        .from("weekly_bags")
        .update({
          subtotal,
          total_amount: total
        })
        .eq("id", currentWeekBag.id);

      setCurrentWeekBag(prev => prev ? {
        ...prev,
        subtotal,
        total_amount: total
      } : null);
    } catch (error) {
      console.error("Error updating bag totals:", error);
    }
  };

  const confirmBag = async () => {
    if (!currentWeekBag || bagItems.length === 0) {
      toast({
        title: "Empty Bag",
        description: "Add items to your bag before confirming.",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase
        .from("weekly_bags")
        .update({
          is_confirmed: true,
          confirmed_at: new Date().toISOString()
        })
        .eq("id", currentWeekBag.id);

      setCurrentWeekBag(prev => prev ? {
        ...prev,
        is_confirmed: true,
        confirmed_at: new Date().toISOString()
      } : null);

      toast({
        title: "Bag Confirmed!",
        description: "Your bag has been confirmed for this week's delivery.",
      });
    } catch (error) {
      console.error("Error confirming bag:", error);
      toast({
        title: "Error",
        description: "Failed to confirm bag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReorderFromHistory = async (historyItems: any[]) => {
    if (!currentWeekBag || currentWeekBag.is_confirmed || isLocked) {
      toast({
        title: "Cannot Reorder",
        description: "Your current bag is locked and cannot be modified.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const item of historyItems) {
        await updateItemQuantity(item.product_id, item.quantity);
      }
    } catch (error) {
      console.error("Error reordering from history:", error);
    }
  };

  const getCurrentBagProducts = () => {
    return bagItems.reduce((acc, item) => {
      acc[item.product_id] = item.quantity;
      return acc;
    }, {} as Record<string, number>);
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
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

  // Show subscription required message if user doesn't have an active subscription
  if (hasActiveSubscription === false) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">My Bag</h1>
              <p className="text-muted-foreground">
                Customize your weekly farm box delivery
              </p>
            </div>

            <Card className="border-dashed border-2 border-muted-foreground/20">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-foreground">
                      Start Your Farm Box Journey
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Purchase your first farm box to start customizing your weekly delivery 
                      of fresh, local produce and artisanal goods.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="px-8" onClick={() => navigate('/box-selection')}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Purchase Your First Box
                    </Button>
                    <Button variant="outline" size="lg" className="px-8" asChild>
                      <Link to="/how-farm-bags-work">
                        Learn More About Our Boxes
                      </Link>
                    </Button>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">
                          What you'll get:
                        </p>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          <li>• Fresh, locally-sourced produce</li>
                          <li>• Artisanal pantry items</li>
                          <li>• Weekly customization options</li>
                          <li>• Flexible delivery schedule</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Bag</h1>
            <p className="text-muted-foreground">
              Customize your weekly farm box delivery
            </p>
          </div>

          {/* Countdown Timer */}
          {currentWeekBag && (
            <CountdownTimer
              cutoffTime={currentWeekBag.cutoff_time}
              isConfirmed={currentWeekBag.is_confirmed}
            />
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Bag Items & Products */}
            <div className="lg:col-span-2 space-y-8">
              {/* Current Week Items */}
              {bagItems.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-semibold">This Week's Selections</h2>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {bagItems.length} item{bagItems.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bagItems.map((item) => (
                      <BagItemCard 
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateItemQuantity}
                        isLocked={currentWeekBag?.is_confirmed || isLocked}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyBagState onStartShopping={scrollToProducts} />
              )}

              {/* Available Products */}
              <div id="products-section">
                <ProductGrid 
                  bagItems={getCurrentBagProducts()} 
                  onUpdateQuantity={updateItemQuantity}
                  isLocked={currentWeekBag?.is_confirmed || isLocked}
                />
              </div>

              {/* Bag History */}
              <BagHistory
                onReorderBag={handleReorderFromHistory}
                isCurrentWeekLocked={isLocked || currentWeekBag?.is_confirmed || false}
              />
            </div>

            {/* Right Side - Summary */}
            <div className="space-y-6">
              <WeeklyBagSummary
                weeklyBag={currentWeekBag}
                itemCount={bagItems.length}
                onConfirmBag={confirmBag}
                isLocked={isLocked}
                loading={loading}
              />
              
              {/* Subscription Management */}
              <SubscriptionManager 
                subscription={subscription}
                onSubscriptionUpdate={checkSubscriptionAndInitialize}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyBag;