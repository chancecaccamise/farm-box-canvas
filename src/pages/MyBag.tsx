
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, AlertCircle, Package, Calendar, RefreshCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WeeklyBagSummary } from "@/components/WeeklyBagSummary";
import { EmptyBagState } from "@/components/EmptyBagState";
import { BagItemCard } from "@/components/BagItemCard";
import { ReadOnlyBagItem } from "@/components/ReadOnlyBagItem";
import { AddOnsGrid } from "@/components/AddOnsGrid";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { UnconfirmBagDialog } from "@/components/UnconfirmBagDialog";
import { useCheckout } from "@/contexts/CheckoutContext";

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
  box_size: string;
  box_price: number;
  addons_total: number;
}

interface WeeklyBagItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  item_type: 'box_item' | 'addon';
  products: {
    id: string;
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
  const { checkoutState, updateAddOns } = useCheckout();

  const handleNonSubscriberAddOnUpdate = (productId: string, quantity: number) => {
    const currentAddOns = checkoutState.addOns || {};
    if (quantity <= 0) {
      const { [productId]: removed, ...rest } = currentAddOns;
      updateAddOns(rest);
    } else {
      updateAddOns({ ...currentAddOns, [productId]: quantity });
    }
  };
  const [currentWeekBag, setCurrentWeekBag] = useState<WeeklyBag | null>(null);
  const [bagItems, setBagItems] = useState<WeeklyBagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showUnconfirmDialog, setShowUnconfirmDialog] = useState(false);
  const [unconfirmLoading, setUnconfirmLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscriptionAndInitialize();
    }
  }, [user]);

  const checkSubscriptionAndInitialize = async () => {
    try {
      // Check if user has an active subscription - get the most recent active one
      const { data: subscriptionsData, error: subError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (subError) {
        throw subError;
      }

      // Find the most recent active subscription
      const activeSubscription = subscriptionsData?.find(sub => sub.status === 'active');
      const isActiveSubscription = !!activeSubscription;
      
      setSubscription(activeSubscription || null);
      setHasActiveSubscription(isActiveSubscription);

      if (isActiveSubscription) {
        await initializeCurrentWeekBag();
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      
      // More specific error handling
      if (error.message?.includes('PGRST116')) {
        console.log("No subscription found, user needs to start one");
        setHasActiveSubscription(false);
      } else {
        // For other errors, show user-friendly message
        toast({
          title: "Connection Error",
          description: "Having trouble loading your subscription. Please refresh the page.",
          variant: "destructive",
        });
        setHasActiveSubscription(false);
      }
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

  // Set up real-time subscription for bag item changes
  useEffect(() => {
    if (!user || !currentWeekBag?.id) return;

    const channel = supabase
      .channel('weekly-bag-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_bag_items',
          filter: `weekly_bag_id=eq.${currentWeekBag.id}`
        },
        (payload) => {
          console.log('Bag items updated:', payload);
          // Refresh the bag when items change
          initializeCurrentWeekBag();
          
          // Show notification if it's an update from template confirmation
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            toast({
              title: "Bag Updated",
              description: "Your bag contents have been updated based on this week's confirmed selections.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentWeekBag?.id]);

  const initializeCurrentWeekBag = async () => {
    try {
      // Use the new function that handles box size and templates
      const { data: bagIdData, error: bagError } = await supabase
        .rpc('get_or_create_current_week_bag_with_size', { 
          user_uuid: user?.id,
          box_size_name: 'medium' // Default to medium, user can change later
        });

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
          item_type,
          products (
            id,
            name,
            price,
            category,
            image
          )
        `)
        .eq("weekly_bag_id", bagId);

      if (error) throw error;
      setBagItems((data || []) as WeeklyBagItem[]);
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

  const canUnconfirmBag = () => {
    if (!currentWeekBag) return false;
    const now = new Date();
    const cutoff = new Date(currentWeekBag.cutoff_time);
    return currentWeekBag.is_confirmed && now <= cutoff;
  };

  const handleUnconfirmBag = async () => {
    if (!currentWeekBag) return;
    
    setUnconfirmLoading(true);
    try {
      // Update the weekly bag to unconfirmed status
      const { error: updateError } = await supabase
        .from("weekly_bags")
        .update({ 
          is_confirmed: false, 
          confirmed_at: null 
        })
        .eq("id", currentWeekBag.id);

      if (updateError) throw updateError;

      // Repopulate with latest template items (this preserves add-ons)
      const { error: populateError } = await supabase
        .rpc('populate_weekly_bag_from_template', {
          bag_id: currentWeekBag.id,
          box_size_name: currentWeekBag.box_size,
          week_start: currentWeekBag.week_start_date
        });

      if (populateError) {
        console.error("Error repopulating bag:", populateError);
        // Continue anyway - the unconfirm still worked
      }

      // Refresh the bag data
      await initializeCurrentWeekBag();

      toast({
        title: "Bag Unconfirmed",
        description: "Your bag has been unconfirmed and updated with the latest box contents. You can now make changes.",
      });
    } catch (error) {
      console.error("Error unconfirming bag:", error);
      toast({
        title: "Error",
        description: "Failed to unconfirm your bag. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUnconfirmLoading(false);
    }
  };

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    // Only prevent editing if cutoff time has passed OR bag is confirmed
    if (!currentWeekBag || isLocked || currentWeekBag.is_confirmed) {
      toast({
        title: "Cannot Modify",
        description: currentWeekBag?.is_confirmed 
          ? "Your bag is confirmed. Please unconfirm it first to make changes."
          : "The cutoff time has passed and your bag can no longer be modified.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (newQuantity <= 0) {
        // Remove addon item only (box items can't be removed)
        await supabase
          .from("weekly_bag_items")
          .delete()
          .eq("weekly_bag_id", currentWeekBag.id)
          .eq("product_id", productId)
          .eq("item_type", "addon");
      } else {
        // Get current product price
        const { data: productData } = await supabase
          .from("products")
          .select("price")
          .eq("id", productId)
          .single();

        if (!productData) return;

        // Check if item exists
        const { data: existingItem } = await supabase
          .from("weekly_bag_items")
          .select("*")
          .eq("weekly_bag_id", currentWeekBag.id)
          .eq("product_id", productId)
          .maybeSingle();

        if (existingItem) {
          // Update existing addon only
          if (existingItem.item_type === 'addon') {
            await supabase
              .from("weekly_bag_items")
              .update({ quantity: newQuantity })
              .eq("weekly_bag_id", currentWeekBag.id)
              .eq("product_id", productId);
          }
        } else {
          // Add new addon
          await supabase
            .from("weekly_bag_items")
            .insert({
              weekly_bag_id: currentWeekBag.id,
              product_id: productId,
              quantity: newQuantity,
              price_at_time: productData.price,
              item_type: "addon"
            });
        }
      }

      await fetchBagItems(currentWeekBag.id);
      await updateBagTotals();
      
      toast({
        title: "Success",
        description: `${newQuantity > 0 ? 'Added to' : 'Removed from'} your bag`,
      });
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
      // Use the database function to update totals
      const { error } = await supabase
        .rpc('update_weekly_bag_totals', { bag_id: currentWeekBag.id });

      if (error) throw error;

      // Refresh the weekly bag data
      const { data: bagData, error: fetchError } = await supabase
        .from("weekly_bags")
        .select("*")
        .eq("id", currentWeekBag.id)
        .single();

      if (!fetchError && bagData) {
        setCurrentWeekBag(bagData);
      }
    } catch (error) {
      console.error("Error updating bag totals:", error);
    }
  };

  const handleCheckout = async () => {
    if (!currentWeekBag || !bagItems) {
      toast({
        title: "Error",
        description: "Unable to process checkout. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          weeklyBag: currentWeekBag,
          bagItems: bagItems,
          hasActiveSubscription: hasActiveSubscription
        }
      });

      if (error) {
        console.error("Payment error:", error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBoxItems = () => {
    return bagItems.filter(item => item.item_type === 'box_item');
  };

  const getAddonItems = () => {
    return bagItems.filter(item => item.item_type === 'addon');
  };

  const getCurrentBagProducts = () => {
    return bagItems
      .filter(item => item.item_type === 'addon')
      .reduce((acc, item) => {
        acc[item.product_id] = item.quantity;
        return acc;
      }, {} as Record<string, number>);
  };

  const formatWeekDate = () => {
    if (!currentWeekBag?.week_start_date) return "";
    const startDate = new Date(currentWeekBag.week_start_date);
    const endDate = new Date(currentWeekBag.week_end_date);
    
    return `${startDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    })} - ${endDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    })}`;
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

  if (hasActiveSubscription === false) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">My Bag</h1>
              <p className="text-muted-foreground">
                Shop add-ons or start your farm box subscription
              </p>
            </div>

            {/* No subscription - offer to start one */}
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
                    <Button size="lg" className="px-8" onClick={() => navigate('/zip-code')}>
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

            {/* Add-ons for non-subscribers */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Or Shop Add-Ons</h2>
                <p className="text-muted-foreground">
                  Browse our premium products and artisanal goods available for individual purchase
                </p>
              </div>
              
              <AddOnsGrid 
                bagItems={checkoutState.addOns || {}} 
                onUpdateQuantity={handleNonSubscriberAddOnUpdate}
                isLocked={false}
              />
              
              {Object.keys(checkoutState.addOns || {}).length > 0 && (
                <div className="text-center pt-6">
                  <Button 
                    onClick={() => navigate('/delivery')}
                    size="lg"
                    className="px-8"
                  >
                    Continue to Checkout
                  </Button>
                </div>
              )}
            </div>
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
              Your curated {currentWeekBag?.box_size} box with optional add-ons
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
            {/* Left Side - Bag Items & Add-ons */}
            <div className="lg:col-span-2 space-y-8">
              {/* This Week's Box Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-primary" />
                    <div>
                      <h2 className="text-2xl font-semibold">
                        Your Box for the Week of {formatWeekDate()}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentWeekBag?.box_size ? currentWeekBag.box_size.charAt(0).toUpperCase() + currentWeekBag.box_size.slice(1) : ''} Box - Curated by our team
                      </p>
                    </div>
                  </div>

                  {/* Bag Status & Unconfirm Button */}
                  <div className="flex items-center gap-3">
                    {currentWeekBag?.is_confirmed ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Confirmed
                        </Badge>
                        {canUnconfirmBag() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUnconfirmDialog(true)}
                            disabled={unconfirmLoading}
                            className="text-primary border-primary hover:bg-primary/10"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Unconfirm
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Open for Changes
                      </Badge>
                    )}
                  </div>
                </div>
                
                {getBoxItems().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getBoxItems().map((item) => (
                      <ReadOnlyBagItem 
                        key={item.id}
                        item={item}
                        partnerName="Billy's Farm" // TODO: Add partner lookup
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium">Your box is being curated by our team</p>
                    <p className="text-sm mt-2">Box contents will appear here once our admin team confirms the {currentWeekBag?.box_size} box template for this week.</p>
                  </div>
                )}

                {/* Status Message - Updated to show confirmation and cutoff info */}
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      {hasActiveSubscription ? (
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {currentWeekBag?.is_confirmed ? "Your confirmed box will be delivered automatically" : "Your box will be delivered automatically"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {currentWeekBag?.is_confirmed
                              ? canUnconfirmBag() 
                                ? "You can still unconfirm to make changes until the cutoff time."
                                : "Your bag is locked for delivery. Changes will apply to next week."
                              : isLocked 
                                ? "Cutoff time has passed. No more changes allowed for this week."
                                : "You can add extras and confirm your bag until the cutoff time."
                            }
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            One-time purchase
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {currentWeekBag?.is_confirmed
                              ? canUnconfirmBag()
                                ? "Your bag is confirmed. You can still unconfirm to make changes."
                                : "Your bag is locked for delivery."
                              : isLocked 
                                ? "Cutoff time has passed. No more changes allowed."
                                : "Complete checkout to receive your box and any add-ons."
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Your Add-ons Section */}
                {getAddonItems().length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-semibold">Your Add-ons</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {getAddonItems().length} item{getAddonItems().length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getAddonItems().map((item) => (
                        <BagItemCard 
                          key={item.id}
                          item={item}
                          onUpdateQuantity={updateItemQuantity}
                          isLocked={isLocked || currentWeekBag?.is_confirmed || false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Browse Add-ons Section */}
              <AddOnsGrid 
                bagItems={getCurrentBagProducts()} 
                onUpdateQuantity={updateItemQuantity}
                isLocked={isLocked || currentWeekBag?.is_confirmed || false}
              />
            </div>

            {/* Right Side - Summary */}
            <div className="space-y-6">
              <WeeklyBagSummary
                weeklyBag={currentWeekBag}
                itemCount={bagItems.length}
                onCheckout={handleCheckout}
                isLocked={isLocked}
                loading={loading}
                hasActiveSubscription={hasActiveSubscription}
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

      {/* Unconfirm Dialog */}
      <UnconfirmBagDialog
        isOpen={showUnconfirmDialog}
        onClose={() => setShowUnconfirmDialog(false)}
        onConfirm={handleUnconfirmBag}
        loading={unconfirmLoading}
        boxSize={currentWeekBag?.box_size || 'medium'}
      />
    </div>
  );
}

export default MyBag;
