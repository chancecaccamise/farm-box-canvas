
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  is_available: boolean;
  inventory_count: number;
}

interface AddOnsGridProps {
  bagItems: Record<string, number>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  isLocked?: boolean;
  confirmedAddons?: string[]; // Product IDs that are already confirmed/paid
}

const PRODUCTS_PER_PAGE = 9;
const CATEGORIES = ["All", "Vegetables", "Fruits", "Herbs", "Dairy", "Meat", "Fish", "Bakery", "Pantry", "Other"];

export function AddOnsGrid({ bagItems, onUpdateQuantity, isLocked = false, confirmedAddons = [] }: AddOnsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);

  useEffect(() => {
    fetchAddOnProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const fetchAddOnProducts = async () => {
    try {
      // Fetch ALL available products that users can add as add-ons
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching add-on products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
    setDisplayCount(PRODUCTS_PER_PAGE);
  };

  const displayedProducts = filteredProducts.slice(0, displayCount);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Browse Add-Ons</h2>
        </div>
        <p className="text-muted-foreground">
          Supplement your weekly box with these additional fresh products.
        </p>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search add-ons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={bagItems[product.id] || 0}
            onUpdateQuantity={onUpdateQuantity}
            isLocked={isLocked}
            isConfirmed={confirmedAddons.includes(product.id)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">No add-ons found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
