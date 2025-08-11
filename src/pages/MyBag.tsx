import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeeklyBagSummary } from "@/components/WeeklyBagSummary";
import { BagItemCard } from "@/components/BagItemCard";
import { ReadOnlyBagItem } from "@/components/ReadOnlyBagItem";
import { AddOnsGrid } from "@/components/AddOnsGrid";
import { StartFarmBoxJourney } from "@/components/StartFarmBoxJourney";
import { Badge } from "@/components/ui/badge";

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
  is_paid: boolean;
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
  
  const [currentWeekBag, setCurrentWeekBag] = useState<WeeklyBag | null>(null);
  const [bagItems, setBagItems] = useState<WeeklyBagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [hasPaidForThisWeek, setHasPaidForThisWeek] = useState<boolean>(false);
  const [templateStatus, setTemplateStatus] = useState<{hasTemplates: boolean, isConfirmed: boolean}>({hasTemplates: false, isConfirmed: false});

  useEffect(() => {
    if (user) {
      initializeUserData();
    }
  }, [user]);

  // Real-time subscriptions for template and bag changes
  useEffect(() => {
    if (!currentWeekBag) return;

    const channel = supabase
      .channel('box-template-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'box_templates',
          filter: `week_start_date=eq.${currentWeekBag.week_start_date}`,
        },
        () => {
          // Refetch bag items and template status when templates change
          initializeCurrentWeekBag();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_bag_items',
          filter: `weekly_bag_id=eq.${currentWeekBag.id}`,
        },
        () => {
          // Refetch bag items when they change
          fetchBagItems(currentWeekBag.id);
          updateBagTotals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWeekBag?.id, currentWeekBag?.week_start_date]);

  const initializeUserData = async () => {
    try {
      // Check subscription status
      const { data: subscriptionsData, error: subError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .limit(1);

      if (subError) throw subError;
      setHasActiveSubscription(subscriptionsData && subscriptionsData.length > 0);

      // Check if user has already paid for this week
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Monday
      const currentWeekStartString = currentWeekStart.toISOString().split('T')[0];

      const { data: paidOrders, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user?.id)
        .eq("payment_status", "paid")
        .eq("week_start_date", currentWeekStartString)
        .limit(1);

      if (orderError) throw orderError;
      setHasPaidForThisWeek(paidOrders && paidOrders.length > 0);

      // Initialize current week bag
      await initializeCurrentWeekBag();
    } catch (error) {
      console.error("Error initializing user data:", error);
      setLoading(false);
    }
  };

  const initializeCurrentWeekBag = async () => {
    try {
      const { data: bagIdData, error: bagError } = await supabase
        .rpc('get_or_create_current_week_bag_with_size', { 
          user_uuid: user?.id,
          box_size_name: 'medium'
        });

      if (bagError) throw bagError;

      const { data: bagData, error: fetchError } = await supabase
        .from("weekly_bags")
        .select("*")
        .eq("id", bagIdData)
        .single();

      if (fetchError) throw fetchError;

      setCurrentWeekBag(bagData);
      await fetchBagItems(bagData.id);
      
      // Check template status for this week
      const { data: templateData, error: templateError } = await supabase
        .from('box_templates')
        .select('is_confirmed')
        .eq('week_start_date', bagData.week_start_date)
        .eq('box_size', bagData.box_size);

      if (!templateError) {
        const hasTemplates = templateData && templateData.length > 0;
        const isConfirmed = hasTemplates && templateData.every(t => t.is_confirmed);
        setTemplateStatus({ hasTemplates, isConfirmed });
      }
      
      // Check if cutoff time has passed
      const cutoffTime = new Date(bagData.cutoff_time);
      const now = new Date();
      setIsLocked(now > cutoffTime);
    } catch (error) {
      console.error("Error initializing weekly bag:", error);
    } finally {
      setLoading(false);
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
          is_paid,
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

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    if (!currentWeekBag || isLocked || currentWeekBag.is_confirmed) return;

    try {
      if (newQuantity <= 0) {
        await supabase
          .from("weekly_bag_items")
          .delete()
          .eq("weekly_bag_id", currentWeekBag.id)
          .eq("product_id", productId)
          .eq("item_type", "addon");
      } else {
        const { data: productData } = await supabase
          .from("products")
          .select("price")
          .eq("id", productId)
          .single();

        if (!productData) return;

        const { data: existingItem } = await supabase
          .from("weekly_bag_items")
          .select("*")
          .eq("weekly_bag_id", currentWeekBag.id)
          .eq("product_id", productId)
          .maybeSingle();

        if (existingItem && existingItem.item_type === 'addon') {
          await supabase
            .from("weekly_bag_items")
            .update({ quantity: newQuantity })
            .eq("weekly_bag_id", currentWeekBag.id)
            .eq("product_id", productId);
        } else if (!existingItem) {
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
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  };

  const updateBagTotals = async () => {
    if (!currentWeekBag) return;

    try {
      const { error } = await supabase
        .rpc('update_weekly_bag_totals', { bag_id: currentWeekBag.id });

      if (error) throw error;

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
    if (!currentWeekBag || !bagItems || isLocked || currentWeekBag.is_confirmed) return;

    const addonItems = bagItems.filter(item => item.item_type === 'addon' && !item.is_paid);
    const unpaidAddons = addonItems.filter(item => !item.is_paid);
    
    // If user already paid for this week and is a subscriber, only allow addon checkout
    if (hasPaidForThisWeek && hasActiveSubscription) {
      if (unpaidAddons.length === 0) {
        toast({
          title: "No new items to checkout",
          description: "All your items have already been paid for.",
        });
        return;
      }
    }
    
    if (hasActiveSubscription && addonItems.length === 0) {
      // Subscriber with only box items - confirm without payment
      setLoading(true);
      try {
        const { error } = await supabase
          .from("weekly_bags")
          .update({ 
            is_confirmed: true, 
            confirmed_at: new Date().toISOString() 
          })
          .eq("id", currentWeekBag.id);

        if (error) throw error;

        toast({
          title: "Bag Confirmed!",
          description: "Your weekly bag has been confirmed.",
        });

        await initializeCurrentWeekBag();
      } catch (error) {
        console.error("Error confirming bag:", error);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      // Determine what items to checkout based on user status
      let itemsToCheckout;
      if (hasPaidForThisWeek && hasActiveSubscription) {
        // Only charge for new unpaid add-ons
        itemsToCheckout = unpaidAddons;
      } else if (hasActiveSubscription) {
        // Charge for add-ons only (subscription covers box)
        itemsToCheckout = addonItems;
      } else {
        // Charge for everything (new customer)
        itemsToCheckout = bagItems;
      }
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          weeklyBag: currentWeekBag,
          bagItems: itemsToCheckout,
          hasActiveSubscription: hasActiveSubscription,
          hasPaidForThisWeek: hasPaidForThisWeek
        }
      });

      if (error) {
        console.error("Payment error:", error);
        toast({
          title: "Payment Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  const getBoxItems = () => {
    return bagItems.filter(item => item.item_type === 'box_item');
  };

  const getConfirmedAddons = () => {
    return bagItems.filter(item => item.item_type === 'addon');
  };

  const getAddonQuantities = () => {
    const quantities: Record<string, number> = {};
    bagItems.forEach(item => {
      if (item.item_type === 'addon') {
        quantities[item.product_id] = item.quantity;
      }
    });
    return quantities;
  };

  const hasBoxItems = () => {
    return getBoxItems().length > 0;
  };

  const getConfirmedAddonIds = () => {
    return getConfirmedAddons().map(item => item.product_id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mb-6"></div>
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Please log in to view your bag.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Start Farm Box Journey if no current bag
  if (!currentWeekBag) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <StartFarmBoxJourney />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Bag</h1>
            <p className="text-muted-foreground">
              Review your weekly farm box contents and add any extras you'd like.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content - Bag Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Box Items Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Box Contents</h2>
                  {hasBoxItems() && !templateStatus.isConfirmed && templateStatus.hasTemplates && (
                    <Badge variant="secondary">Preview - Not Confirmed</Badge>
                  )}
                  {hasBoxItems() && templateStatus.isConfirmed && (
                    <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>
                  )}
                </div>
                {hasBoxItems() ? (
                  <div className="space-y-3">
                    {getBoxItems().map((item) => (
                      <ReadOnlyBagItem
                        key={item.id}
                        item={item}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    {!templateStatus.hasTemplates ? (
                      <div>
                        <p className="font-medium mb-2">Box Contents Coming Soon</p>
                        <p className="text-sm">Our team is still preparing the contents for this week's {currentWeekBag.box_size} box.</p>
                        <p className="text-sm">Check back soon to see what fresh, local products will be included!</p>
                      </div>
                    ) : !templateStatus.isConfirmed ? (
                      <div>
                        <p className="font-medium mb-2">Contents Being Finalized</p>
                        <p className="text-sm">The contents are being finalized. You'll see a preview shortly and the final contents will be confirmed soon.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium mb-2">No Items Available</p>
                        <p className="text-sm">No items are currently available for this box size.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Current Add-ons */}
              {getConfirmedAddons().length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Your Add-ons</h2>
                  <div className="space-y-3">
                    {getConfirmedAddons().map((item) => (
                      <BagItemCard
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateItemQuantity}
                        isLocked={isLocked || currentWeekBag.is_confirmed}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Grid */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Or Shop Add-Ons</h2>
                <AddOnsGrid
                  bagItems={getAddonQuantities()}
                  onUpdateQuantity={updateItemQuantity}
                  isLocked={isLocked || currentWeekBag.is_confirmed}
                  confirmedAddons={getConfirmedAddonIds()}
                />
              </div>
            </div>

            {/* Sidebar - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <WeeklyBagSummary
                  weeklyBag={currentWeekBag}
                  itemCount={bagItems.length}
                  onCheckout={handleCheckout}
                  isLocked={isLocked}
                  hasActiveSubscription={hasActiveSubscription}
                  loading={loading}
                  unpaidAddonsTotal={bagItems.filter(item => item.item_type === 'addon' && !item.is_paid).reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyBag;