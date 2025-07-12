import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface ProductGridProps {
  bagItems: Record<string, number>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

const PRODUCTS_PER_PAGE = 12;
const CATEGORIES = ["All", "Produce", "Protein", "Pantry", "Seafood", "Herbs"];

export function ProductGrid({ bagItems, onUpdateQuantity }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("category")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
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
    setHasMore(filtered.length > PRODUCTS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const newDisplayCount = displayCount + PRODUCTS_PER_PAGE;
      setDisplayCount(newDisplayCount);
      setHasMore(filteredProducts.length > newDisplayCount);
      setLoadingMore(false);
    }, 500);
  };

  const displayedProducts = filteredProducts.slice(0, displayCount);

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
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Available Products</h2>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Product Image */}
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm leading-tight">{product.name}</h3>
                    <Badge className={getCategoryColor(product.category)}>
                      {product.category}
                    </Badge>
                  </div>
                  
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {product.inventory_count} in stock
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between">
                  {bagItems[product.id] ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(product.id, bagItems[product.id] - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {bagItems[product.id]}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(product.id, bagItems[product.id] + 1)}
                        disabled={bagItems[product.id] >= product.inventory_count}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      disabled={product.inventory_count === 0}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add to Bag
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load More Products"
            )}
          </Button>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}