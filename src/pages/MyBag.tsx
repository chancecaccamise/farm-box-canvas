import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CountdownTimer } from "@/components/CountdownTimer";
import { BagHistory } from "@/components/BagHistory";
import { WeeklyBagSummary } from "@/components/WeeklyBagSummary";
import { ProductGrid } from "@/components/ProductGrid";

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
  const [currentWeekBag, setCurrentWeekBag] = useState<WeeklyBag | null>(null);
  const [bagItems, setBagItems] = useState<WeeklyBagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (user) {
      initializeCurrentWeekBag();
    }
  }, [user]);

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

      if (bagError) throw bagError;

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

  const getCategoryColor = (category: string) => {
    const colors = {
      produce: "bg-green-100 text-green-800 border-green-200",
      protein: "bg-red-100 text-red-800 border-red-200",
      pantry: "bg-yellow-100 text-yellow-800 border-yellow-200",
      seafood: "bg-blue-100 text-blue-800 border-blue-200",
      herbs: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[category.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
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
              {bagItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-semibold">This Week's Selections</h2>
                    <Badge variant="outline">
                      {bagItems.length} item{bagItems.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {bagItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                                {item.products.image ? (
                                  <img
                                    src={item.products.image}
                                    alt={item.products.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    No Image
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg">{item.products.name}</h3>
                                    <p className="text-sm text-muted-foreground">Fresh & Local</p>
                                  </div>
                                  <Badge className={getCategoryColor(item.products.category)}>
                                    {item.products.category}
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center space-x-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                                      disabled={currentWeekBag?.is_confirmed || isLocked}
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="text-lg font-medium w-8 text-center">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                                      disabled={currentWeekBag?.is_confirmed || isLocked}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">
                                        ${item.price_at_time.toFixed(2)} each
                                      </p>
                                      <p className="font-semibold">
                                        ${(item.price_at_time * item.quantity).toFixed(2)}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateItemQuantity(item.product_id, 0)}
                                      disabled={currentWeekBag?.is_confirmed || isLocked}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Products Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">
                  {bagItems.length > 0 ? "Add More Products" : "Choose Your Products"}
                </h2>
                <ProductGrid
                  bagItems={getCurrentBagProducts()}
                  onUpdateQuantity={updateItemQuantity}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyBag;