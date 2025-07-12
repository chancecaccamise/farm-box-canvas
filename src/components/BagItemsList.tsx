import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BagItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    name: string;
    price: number;
    category: string;
    image: string;
  };
}

interface BagItemsListProps {
  bagItems: Record<string, number>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export function BagItemsList({ bagItems, onUpdateQuantity }: BagItemsListProps) {
  const [bagDetails, setBagDetails] = useState<BagItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Object.keys(bagItems).length > 0) {
      fetchBagDetails();
    } else {
      setBagDetails([]);
    }
  }, [bagItems]);

  const fetchBagDetails = async () => {
    setLoading(true);
    try {
      const productIds = Object.keys(bagItems);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, image")
        .in("id", productIds);

      if (error) throw error;

      const bagDetailsWithQuantity = data.map(product => ({
        id: product.id,
        product_id: product.id,
        quantity: bagItems[product.id],
        products: {
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image,
        }
      }));

      setBagDetails(bagDetailsWithQuantity);
    } catch (error) {
      console.error("Error fetching bag details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Produce": return "bg-green-100 text-green-800";
      case "Protein": return "bg-orange-100 text-orange-800";
      case "Pantry": return "bg-purple-100 text-purple-800";
      case "produce": return "bg-green-100 text-green-800";
      case "protein": return "bg-orange-100 text-orange-800";
      case "pantry": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-32"></div>
                </div>
                <div className="h-16 w-16 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bagDetails.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{item.products.name}</h3>
                    <p className="text-sm text-muted-foreground">Fresh & Local</p>
                  </div>
                  <Badge variant="secondary" className={getCategoryColor(item.products.category)}>
                    {item.products.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">${item.products.price.toFixed(2)} each</p>
                      <p className="font-semibold">${(item.products.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.product_id, 0)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}