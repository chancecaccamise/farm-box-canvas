import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, Filter, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import bellPeppersImg from "@/assets/bell-peppers.jpg";
import leafyGreensImg from "@/assets/leafy-greens.jpg";
import tomatoesImg from "@/assets/tomatoes.jpg";
import rainbowCarrotsImg from "@/assets/rainbow-carrots.jpg";

type Category = "all" | "produce" | "protein" | "pantry";

interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  image: string;
}

const ProductSelection = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const maxItems = 15; // Medium box default
  const navigate = useNavigate();

  const products: Product[] = [
    {
      id: "bell-peppers",
      name: "Bell Pepper Trio",
      description: "Red, yellow, and orange sweet peppers",
      category: "produce",
      image: bellPeppersImg
    },
    {
      id: "leafy-greens",
      name: "Leafy Greens Mix",
      description: "Fresh spinach, arugula, and baby kale",
      category: "produce", 
      image: leafyGreensImg
    },
    {
      id: "heritage-tomatoes",
      name: "Heritage Tomatoes",
      description: "Colorful heirloom varieties, vine-ripened",
      category: "produce",
      image: tomatoesImg
    },
    {
      id: "rainbow-carrots",
      name: "Rainbow Carrots",
      description: "Purple, orange, and yellow heritage carrots",
      category: "produce",
      image: rainbowCarrotsImg
    },
    {
      id: "grass-fed-beef",
      name: "Grass-Fed Ground Beef",
      description: "1 lb locally sourced grass-fed beef",
      category: "protein",
      image: "🥩"
    },
    {
      id: "free-range-chicken",
      name: "Free-Range Chicken Breast",
      description: "2 lbs organic free-range chicken",
      category: "protein", 
      image: "🐓"
    },
    {
      id: "wild-salmon",
      name: "Wild-Caught Salmon",
      description: "1.5 lbs Alaskan wild salmon fillets",
      category: "protein",
      image: "🐟"
    },
    {
      id: "farm-eggs",
      name: "Farm Fresh Eggs",
      description: "1 dozen pasture-raised eggs",
      category: "protein",
      image: "🥚"
    },
    {
      id: "artisan-bread",
      name: "Artisan Sourdough",
      description: "Fresh baked sourdough loaf",
      category: "pantry",
      image: "🍞"
    },
    {
      id: "local-honey",
      name: "Local Wildflower Honey",
      description: "12 oz raw unfiltered honey",
      category: "pantry",
      image: "🍯"
    },
    {
      id: "olive-oil",
      name: "Extra Virgin Olive Oil",
      description: "500ml cold-pressed olive oil",
      category: "pantry",
      image: "🫒"
    },
    {
      id: "cheese-selection",
      name: "Artisan Cheese Selection",
      description: "3 varieties of local farmstead cheese",
      category: "pantry",
      image: "🧀"
    }
  ];

  const categories = [
    { id: "all" as Category, name: "All Items", count: products.length },
    { id: "produce" as Category, name: "Produce", count: products.filter(p => p.category === "produce").length },
    { id: "protein" as Category, name: "Protein", count: products.filter(p => p.category === "protein").length },
    { id: "pantry" as Category, name: "Pantry", count: products.filter(p => p.category === "pantry").length }
  ];

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const totalSelectedItems = Object.values(selectedItems).reduce((sum, count) => sum + count, 0);
  const remainingItems = maxItems - totalSelectedItems;

  const updateItemCount = (productId: string, delta: number) => {
    const currentCount = selectedItems[productId] || 0;
    const newCount = Math.max(0, currentCount + delta);
    
    if (delta > 0 && remainingItems <= 0) return; // Can't add more items
    
    setSelectedItems(prev => ({
      ...prev,
      [productId]: newCount
    }));
  };

  const handleContinue = () => {
    navigate("/add-ons");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" asChild>
            <Link to="/box-selection">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold">
                {totalSelectedItems} of {maxItems} items selected
              </div>
              <div className="text-sm text-muted-foreground">
                {remainingItems} remaining
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-fresh rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Build Your Box</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your favorite fresh ingredients from our weekly selection
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-secondary rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-fresh h-full transition-all duration-300"
              style={{ width: `${(totalSelectedItems / maxItems) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              <Filter className="w-4 h-4 mr-2" />
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {filteredProducts.map((product) => {
            const count = selectedItems[product.id] || 0;
            const canAdd = remainingItems > 0 || count > 0;
            
            return (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative overflow-hidden">
                  {typeof product.image === 'string' && product.image.includes('/') ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center text-6xl">
                      {product.image}
                    </div>
                  )}
                  {count > 0 && (
                    <Badge className="absolute top-2 right-2 bg-primary">
                      {count}
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateItemCount(product.id, -1)}
                        disabled={count === 0}
                        className="h-8 w-8"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="w-8 text-center font-medium">{count}</span>
                      
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateItemCount(product.id, 1)}
                        disabled={!canAdd}
                        className="h-8 w-8"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {count > 0 && (
                      <Badge variant="secondary">Added</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            variant="hero"
            size="xl"
            disabled={totalSelectedItems === 0}
            className="w-full md:w-auto"
          >
            Continue to Add-Ons ({totalSelectedItems} items selected)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelection;