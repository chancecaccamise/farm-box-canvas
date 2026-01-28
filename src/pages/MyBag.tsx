import { useState, useEffect } from "react";
import { Package, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrderCutoff } from "@/hooks/useOrderCutoff";
import { useCheckoutStatus } from "@/hooks/useCheckoutStatus";
import { WeeklyBagSummary } from "@/components/WeeklyBagSummary";
import { BagItemCard } from "@/components/BagItemCard";
import { ReadOnlyBagItem } from "@/components/ReadOnlyBagItem";
import { AddOnsGrid } from "@/components/AddOnsGrid";
import { StartFarmBoxJourney } from "@/components/StartFarmBoxJourney";
import { UnconfirmBagDialog } from "@/components/UnconfirmBagDialog";
import { UpdateSelectionsDialog } from "@/components/UpdateSelectionsDialog";
import { CheckoutPausedBanner } from "@/components/CheckoutPausedBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  user_full_farm_bag_protein?: string | null;
  user_full_farm_bag_carb?: string | null;
  user_protein_selections?: string[] | null;
}

interface WeeklyBagItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  item_type: 'box_item' | 'addon' | 'user_selected_protein' | 'user_selected_carb';
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
  const { isPastCutoff } = useOrderCutoff();
  const { isCheckoutPaused, pauseMessage } = useCheckoutStatus();
  const [currentWeekBag, setCurrentWeekBag] = useState<WeeklyBag | null>(null);
  const [bagItems, setBagItems] = useState<WeeklyBagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [hasPaidForThisWeek, setHasPaidForThisWeek] = useState<boolean>(false);
  const [hasPendingOrderThisWeek, setHasPendingOrderThisWeek] = useState<boolean>(false);
  const [templateStatus, setTemplateStatus] = useState<{hasTemplates: boolean, isConfirmed: boolean}>({hasTemplates: false, isConfirmed: false});
  const [showUnconfirmDialog, setShowUnconfirmDialog] = useState(false);
  const [unconfirmLoading, setUnconfirmLoading] = useState(false);
  const [showUpdateSelectionsDialog, setShowUpdateSelectionsDialog] = useState(false);

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

      // Check if user has pending orders for this week
      const { data: pendingOrders, error: pendingOrderError } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user?.id)
        .eq("payment_status", "pending")
        .eq("week_start_date", currentWeekStartString)
        .limit(1);

      if (pendingOrderError) throw pendingOrderError;
      setHasPendingOrderThisWeek(pendingOrders && pendingOrders.length > 0);

      // Initialize current week bag
      await initializeCurrentWeekBag();
    } catch (error) {
      console.error("Error initializing user data:", error);
      setLoading(false);
    }
  };

  const initializeCurrentWeekBag = async () => {
    try {
      // Determine user's box size from their most recent order or default to medium
      let userBoxSize = 'medium';
      
      // Check user's most recent order to get their preferred box size
      const { data: recentOrder } = await supabase
        .from('orders')
        .select('box_size')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (recentOrder?.box_size) {
        userBoxSize = recentOrder.box_size;
      }

      const { data: bagIdData, error: bagError } = await supabase
        .rpc('get_or_create_current_week_bag_with_size', { 
          user_uuid: user?.id,
          box_size_name: userBoxSize
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

        // If bag is not confirmed but a confirmed template exists, auto-confirm it
        if (bagData && !bagData.is_confirmed && isConfirmed) {
          console.log("Auto-confirming bag based on confirmed template");
          const { error: confirmError } = await supabase
            .from('weekly_bags')
            .update({
              is_confirmed: true,
              confirmed_at: new Date().toISOString()
            })
            .eq('id', bagData.id);
          
          if (!confirmError) {
            bagData.is_confirmed = true;
            bagData.confirmed_at = new Date().toISOString();
            setCurrentWeekBag(bagData);
          }
        }
      }

      // Enhanced repopulation: always check if bag selections match items
      if (bagData.box_size === 'full_farm_bag' || bagData.box_size === 'protein-pack') {
        // First, get fresh bag items to avoid stale state
        const { data: freshItems } = await supabase
          .from("weekly_bag_items")
          .select(`
            id,
            product_id,
            item_type
          `)
          .eq("weekly_bag_id", bagData.id);
        
        const currentUserSelectedItems = freshItems?.filter(
          item => item.item_type === 'user_selected_protein' || item.item_type === 'user_selected_carb'
        ) || [];
        
        // Check if we have selections in the bag
        let hasUserSelections = 
          (bagData.user_protein_selections && bagData.user_protein_selections.length > 0) || 
          bagData.user_full_farm_bag_protein || 
          bagData.user_full_farm_bag_carb;
        
        // If no selections in bag, try to get from paid order
        if (!hasUserSelections) {
          console.log('No selections in bag, checking order history');
          const { data: orderWithSelections } = await supabase
            .from('orders')
            .select('user_protein_selections, user_full_farm_bag_protein, user_full_farm_bag_carb, box_size')
            .eq('user_id', user.id)
            .eq('week_start_date', bagData.week_start_date)
            .eq('payment_status', 'paid')
            .maybeSingle();
          
          if (orderWithSelections?.user_protein_selections || orderWithSelections?.user_full_farm_bag_protein) {
            console.log('Found selections in order, updating bag');
            const bagUpdateData: any = {};
            
            if (orderWithSelections.box_size === 'protein-pack' && orderWithSelections.user_protein_selections) {
              bagUpdateData.user_protein_selections = orderWithSelections.user_protein_selections;
            }
            if (orderWithSelections.box_size === 'full_farm_bag') {
              if (orderWithSelections.user_full_farm_bag_protein) {
                bagUpdateData.user_full_farm_bag_protein = orderWithSelections.user_full_farm_bag_protein;
              }
              if (orderWithSelections.user_full_farm_bag_carb) {
                bagUpdateData.user_full_farm_bag_carb = orderWithSelections.user_full_farm_bag_carb;
              }
            }
            
            if (Object.keys(bagUpdateData).length > 0) {
              await supabase
                .from('weekly_bags')
                .update(bagUpdateData)
                .eq('id', bagData.id);
              
              // Update local data
              Object.assign(bagData, bagUpdateData);
              hasUserSelections = true;
            }
          }
        }
        
        // If Full Farm Bag is missing box items, repopulate from template
        if (bagData.box_size === 'full_farm_bag' && hasUserSelections && !((freshItems || []).some(i => i.item_type === 'box_item'))) {
          console.log('Repopulating bag - missing box items despite selections');
          const { error: populateError } = await supabase.rpc('populate_weekly_bag_from_template', {
            bag_id: bagData.id,
            box_size_name: bagData.box_size,
            week_start: bagData.week_start_date
          });
          
          if (populateError) {
            console.error('Failed to repopulate bag:', populateError);
          } else {
            console.log('Bag repopulated successfully, refetching items');
            // Refetch items after repopulation
            await fetchBagItems(bagData.id);
          }
        }
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
      
      console.log('📦 [ADD-ON DEBUG] fetchBagItems result:', {
        bagId,
        totalItems: data?.length || 0,
        items: data?.map(item => ({
          name: item.products?.name,
          item_type: item.item_type,
          product_category: item.products?.category,
          is_paid: item.is_paid
        }))
      });
      
      setBagItems((data || []) as WeeklyBagItem[]);
    } catch (error) {
      console.error("Error fetching bag items:", error);
    }
  };

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    console.log('🛒 [ADD-ON DEBUG] updateItemQuantity called:', {
      productId,
      newQuantity,
      bagId: currentWeekBag?.id,
      boxSize: currentWeekBag?.box_size,
      isLocked,
      isConfirmed: currentWeekBag?.is_confirmed
    });

    if (!currentWeekBag || isLocked || currentWeekBag.is_confirmed) {
      console.log('⚠️ [ADD-ON DEBUG] Update blocked - bag locked or confirmed');
      return;
    }

    try {
      if (newQuantity <= 0) {
        console.log('🗑️ [ADD-ON DEBUG] Deleting add-on item');
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

        if (!productData) {
          console.log('❌ [ADD-ON DEBUG] Product not found');
          return;
        }

        const { data: existingItem } = await supabase
          .from("weekly_bag_items")
          .select("*")
          .eq("weekly_bag_id", currentWeekBag.id)
          .eq("product_id", productId)
          .maybeSingle();

        console.log('🔍 [ADD-ON DEBUG] Existing item check:', { existingItem });

        if (existingItem && existingItem.item_type === 'addon') {
          console.log('✏️ [ADD-ON DEBUG] Updating existing add-on');
          await supabase
            .from("weekly_bag_items")
            .update({ quantity: newQuantity })
            .eq("weekly_bag_id", currentWeekBag.id)
            .eq("product_id", productId);
        } else if (!existingItem) {
          console.log('➕ [ADD-ON DEBUG] Inserting new add-on with item_type: addon');
          const { data: insertedData, error: insertError } = await supabase
            .from("weekly_bag_items")
            .insert({
              weekly_bag_id: currentWeekBag.id,
              product_id: productId,
              quantity: newQuantity,
              price_at_time: productData.price,
              item_type: "addon"
            })
            .select();
          
          console.log('✅ [ADD-ON DEBUG] Insert result:', { insertedData, insertError });
        }
      }

      await fetchBagItems(currentWeekBag.id);
      await updateBagTotals();
      console.log('✅ [ADD-ON DEBUG] Item quantity updated successfully');
    } catch (error) {
      console.error("❌ [ADD-ON DEBUG] Error updating item quantity:", error);
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
          hasPaidForThisWeek: hasPaidForThisWeek,
          isSubscription: false // MyBag is always one-time payments for add-ons
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

  const handleUnconfirmBag = async () => {
    if (!currentWeekBag || !currentWeekBag.is_confirmed) return;

    setUnconfirmLoading(true);
    try {
      const { error } = await supabase
        .rpc('unconfirm_weekly_bag', { bag_id: currentWeekBag.id });

      if (error) throw error;

      toast({
        title: "Bag Unconfirmed",
        description: "Your bag has been unconfirmed and updated with the latest contents.",
      });

      // Refresh the bag data
      await initializeCurrentWeekBag();
    } catch (error) {
      console.error("Error unconfirming bag:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unconfirm bag. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUnconfirmLoading(false);
    }
  };

  const getBoxItems = () => {
    return bagItems.filter(item => item.item_type === 'box_item');
  };

  const getUserSelectedItems = () => {
    return bagItems.filter(item => 
      item.item_type === 'user_selected_protein' || 
      item.item_type === 'user_selected_carb'
    );
  };

  const getUserSelectedProteins = () => {
    return bagItems.filter(item => item.item_type === 'user_selected_protein');
  };

  const getUserSelectedCarbs = () => {
    return bagItems.filter(item => item.item_type === 'user_selected_carb');
  };

  const getConfirmedAddons = () => {
    const addons = bagItems.filter(item => item.item_type === 'addon');
    console.log('🔍 [ADD-ON DEBUG] getConfirmedAddons called:', {
      totalBagItems: bagItems.length,
      addonsFound: addons.length,
      bagItemsBreakdown: {
        box_items: bagItems.filter(i => i.item_type === 'box_item').length,
        addons: addons.length,
        user_selected_protein: bagItems.filter(i => i.item_type === 'user_selected_protein').length,
        user_selected_carb: bagItems.filter(i => i.item_type === 'user_selected_carb').length,
      },
      allBagItems: bagItems.map(item => ({
        id: item.id,
        name: item.products.name,
        item_type: item.item_type,
        category: item.products.category,
        is_paid: item.is_paid
      }))
    });
    return addons;
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

  const getTotalItemCount = () => {
    return bagItems.length;
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

  // Show Start Farm Box Journey if user has no active subscription or paid order
  // Pending orders from abandoned checkouts should NOT grant access to bag contents
  if (!hasActiveSubscription && !hasPaidForThisWeek) {
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
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Bag</h1>
              <p className="text-muted-foreground">
                Review your weekly farm box contents and add any extras you'd like.
              </p>
            </div>
            
            {/* Update Selections Button - Only for subscribers with customizable boxes, before cutoff */}
            {hasActiveSubscription && 
             !isPastCutoff && 
             currentWeekBag && 
             (currentWeekBag.box_size === 'full_farm_bag' || currentWeekBag.box_size === 'protein-pack') && (
              <Button 
                onClick={() => setShowUpdateSelectionsDialog(true)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {currentWeekBag.box_size === 'full_farm_bag' 
                  ? 'Change Protein & Carb' 
                  : 'Change My 5 Proteins'}
              </Button>
            )}
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Main content - Bag Items */}
            <div className="space-y-6">
            {/* User Selected Items - Protein Pack (5 proteins) */}
            {currentWeekBag.box_size === 'protein-pack' && getUserSelectedItems().length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Selected Proteins</h2>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">Your 5 Protein Choices</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getUserSelectedItems().map((item) => (
                    <ReadOnlyBagItem
                      key={item.id}
                      item={item}
                      showUserSelectedBadge={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* User Selected Items - Full Farm Bag (protein + carb) */}
            {currentWeekBag.box_size === 'full_farm_bag' && getUserSelectedItems().length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Protein & Carb Choices</h2>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">Your Choice</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getUserSelectedItems().map((item) => (
                    <ReadOnlyBagItem
                      key={item.id}
                      item={item}
                      showUserSelectedBadge={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Box Items Section - Not shown for protein-pack at all */}
            {currentWeekBag.box_size !== 'protein-pack' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {currentWeekBag.box_size === 'full_farm_bag' ? 'Billy\'s Farm Selections' : 'Your Box Contents'}
                  </h2>
                  {hasBoxItems() && !templateStatus.isConfirmed && templateStatus.hasTemplates && (
                    <Badge variant="secondary">Preview - Not Confirmed</Badge>
                  )}
                  {hasBoxItems() && templateStatus.isConfirmed && (
                    <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>
                  )}
                </div>
                {hasBoxItems() ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {currentWeekBag.box_size === 'protein-pack' ? (
                      <div>
                        <p className="font-medium mb-2">Additional Items Coming Soon</p>
                        <p className="text-sm">You've selected your proteins! Any additional items will appear here.</p>
                      </div>
                    ) : !templateStatus.hasTemplates ? (
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
            )}

              {/* Current Add-ons */}
              {(() => {
                const confirmedAddons = getConfirmedAddons();
                console.log('🎨 [ADD-ON DEBUG] Rendering add-ons section:', {
                  boxSize: currentWeekBag?.box_size,
                  confirmedAddonsCount: confirmedAddons.length,
                  willRenderSection: confirmedAddons.length > 0
                });
                return confirmedAddons.length > 0 ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Your Add-ons</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {confirmedAddons.map((item) => (
                        <BagItemCard
                          key={item.id}
                          item={item}
                          onUpdateQuantity={updateItemQuantity}
                          isLocked={isLocked || currentWeekBag.is_confirmed}
                        />
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Add-ons Grid - Display Only */}
              <div>
                <AddOnsGrid
                  bagItems={getAddonQuantities()}
                  onUpdateQuantity={updateItemQuantity}
                  isLocked={true}
                  confirmedAddons={getConfirmedAddonIds()}
                  displayOnly={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Unconfirm Dialog */}
      {currentWeekBag && (
        <UnconfirmBagDialog
          isOpen={showUnconfirmDialog}
          onClose={() => setShowUnconfirmDialog(false)}
          onConfirm={handleUnconfirmBag}
          loading={unconfirmLoading}
          boxSize={currentWeekBag.box_size}
        />
      )}

      {/* Update Selections Dialog */}
      {currentWeekBag && (currentWeekBag.box_size === 'full_farm_bag' || currentWeekBag.box_size === 'protein-pack') && (
        <UpdateSelectionsDialog
          isOpen={showUpdateSelectionsDialog}
          onClose={() => setShowUpdateSelectionsDialog(false)}
          boxSize={currentWeekBag.box_size}
          weeklyBagId={currentWeekBag.id}
          weekStartDate={currentWeekBag.week_start_date}
          cutoffTime={currentWeekBag.cutoff_time}
          currentProtein={currentWeekBag.user_full_farm_bag_protein}
          currentCarb={currentWeekBag.user_full_farm_bag_carb}
          currentProteinSelections={currentWeekBag.user_protein_selections}
          onSelectionsUpdated={() => initializeCurrentWeekBag()}
        />
      )}
    </div>
  );
}

export default MyBag;