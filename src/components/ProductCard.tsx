import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

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

interface ProductCardProps {
  product: Product;
  quantity: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  isLocked: boolean;
}

export function ProductCard({ product, quantity, onUpdateQuantity, isLocked }: ProductCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      produce: "bg-primary/10 text-primary border-primary/20",
      protein: "bg-destructive/10 text-destructive border-destructive/20",
      pantry: "bg-accent/10 text-accent-foreground border-accent/20",
      seafood: "bg-blue-500/10 text-blue-700 border-blue-200",
      herbs: "bg-purple-500/10 text-purple-700 border-purple-200",
    };
    return colors[category.toLowerCase() as keyof typeof colors] || "bg-muted text-muted-foreground border-border";
  };

  const getImageSrc = (image: string | null) => {
    if (!image) return null;
    // If it's already a full URL, return as is
    if (image.startsWith('http')) return image;
    // If it's a path, assume it's in assets
    if (image.startsWith('/')) return image;
    // If it's just a filename, add the assets path
    return `/src/assets/${image}`;
  };

  const imageSrc = getImageSrc(product.image);

  return (
    <Card className="overflow-hidden group hover:shadow-medium transition-all duration-300">
      <div className="aspect-square relative overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div 
          className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center"
          style={{ display: imageSrc ? 'none' : 'flex' }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🥬</div>
            <span className="text-sm text-muted-foreground">Fresh Product</span>
          </div>
        </div>

        {/* Category Badge */}
        <Badge 
          variant="secondary" 
          className={`absolute top-3 left-3 ${getCategoryColor(product.category)} backdrop-blur-sm shadow-soft`}
        >
          {product.category}
        </Badge>

        {/* Quantity Badge */}
        {quantity > 0 && (
          <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm shadow-soft">
            {quantity}x
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Info */}
          <div>
            <h3 className="font-semibold text-base line-clamp-1">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>
            )}
          </div>

          {/* Price and Stock */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">
              {product.inventory_count} in stock
            </span>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-center">
            {quantity > 0 ? (
              <div className="flex items-center gap-3 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                  disabled={isLocked}
                  className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[2rem] text-center">
                  {quantity}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                  disabled={isLocked || quantity >= product.inventory_count}
                  className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => onUpdateQuantity(product.id, 1)}
                disabled={isLocked || product.inventory_count === 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Bag
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}