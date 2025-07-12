import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Calendar, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface BagHistoryItem {
  id: string;
  week_start_date: string;
  week_end_date: string;
  is_confirmed: boolean;
  confirmed_at: string | null;
  subtotal: number;
  total_amount: number;
  weekly_bag_items: {
    id: string;
    quantity: number;
    price_at_time: number;
    products: {
      name: string;
      category: string;
      image: string;
    };
  }[];
}

interface BagHistoryProps {
  onReorderBag: (bagItems: any[]) => void;
  isCurrentWeekLocked: boolean;
}

export function BagHistory({ onReorderBag, isCurrentWeekLocked }: BagHistoryProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [historyBags, setHistoryBags] = useState<BagHistoryItem[]>([]);
  const [expandedBags, setExpandedBags] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBagHistory();
    }
  }, [user]);

  const fetchBagHistory = async () => {
    try {
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Monday

      const { data, error } = await supabase
        .from("weekly_bags")
        .select(`
          id,
          week_start_date,
          week_end_date,
          is_confirmed,
          confirmed_at,
          subtotal,
          total_amount,
          weekly_bag_items (
            id,
            quantity,
            price_at_time,
            products (
              name,
              category,
              image
            )
          )
        `)
        .eq("user_id", user?.id)
        .lt("week_start_date", currentWeekStart.toISOString().split('T')[0])
        .order("week_start_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistoryBags(data || []);
    } catch (error) {
      console.error("Error fetching bag history:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (bagId: string) => {
    const newExpanded = new Set(expandedBags);
    if (newExpanded.has(bagId)) {
      newExpanded.delete(bagId);
    } else {
      newExpanded.add(bagId);
    }
    setExpandedBags(newExpanded);
  };

  const handleReorder = async (bag: BagHistoryItem) => {
    if (isCurrentWeekLocked) {
      toast({
        title: "Cannot Reorder",
        description: "The current week's cutoff has passed. You cannot modify your bag.",
        variant: "destructive",
      });
      return;
    }

    try {
      const reorderItems = bag.weekly_bag_items.map(item => ({
        product_id: item.products,
        quantity: item.quantity,
        price: item.price_at_time
      }));

      await onReorderBag(reorderItems);
      
      toast({
        title: "Bag Reordered!",
        description: `Added ${bag.weekly_bag_items.length} items to your current week's bag.`,
      });
    } catch (error) {
      console.error("Error reordering bag:", error);
      toast({
        title: "Error",
        description: "Failed to reorder bag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatWeekRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })}`;
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bag History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (historyBags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bag History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No Previous Bags</h3>
            <p className="text-muted-foreground">Your bag history will appear here once you complete your first order.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Bag History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {historyBags.map((bag) => (
          <div key={bag.id} className="border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleExpanded(bag.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium">
                      Week of {formatWeekRange(bag.week_start_date, bag.week_end_date)}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {bag.weekly_bag_items.length} items
                      </span>
                      <span className="text-sm font-medium">
                        ${bag.total_amount.toFixed(2)}
                      </span>
                      {bag.is_confirmed && (
                        <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                          Confirmed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isCurrentWeekLocked && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorder(bag);
                      }}
                    >
                      Reorder
                    </Button>
                  )}
                  {expandedBags.has(bag.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>

            {expandedBags.has(bag.id) && (
              <div className="p-4 border-t bg-background">
                <div className="space-y-3">
                  {bag.weekly_bag_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                          {item.products.image ? (
                            <img
                              src={item.products.image}
                              alt={item.products.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">{item.products.name}</h5>
                          <div className="flex items-center gap-2">
                            <Badge className={getCategoryColor(item.products.category)}>
                              {item.products.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          ${(item.price_at_time * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${item.price_at_time.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}