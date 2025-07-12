import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";

interface Product {
  name: string;
  price: number;
  category: string;
  image: string;
}

interface BagItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  products: Product;
}

interface BagItemCardProps {
  item: BagItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  isLocked: boolean;
}

export function BagItemCard({ item, onUpdateQuantity, isLocked }: BagItemCardProps) {
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

  const imageSrc = getImageSrc(item.products.image);

  return (
    <Card className="overflow-hidden group hover:shadow-medium transition-all duration-300">
      <div className="aspect-square relative overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.products.name}
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
        
        {/* Quantity Badge */}
        <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm shadow-soft">
          {item.quantity}x
        </Badge>

        {/* Category Badge */}
        <Badge 
          variant="secondary" 
          className={`absolute top-3 left-3 ${getCategoryColor(item.products.category)} backdrop-blur-sm shadow-soft`}
        >
          {item.products.category}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Info */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{item.products.name}</h3>
            <p className="text-sm text-muted-foreground">Fresh & Local</p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                ${item.price_at_time.toFixed(2)} each
              </p>
              <p className="font-semibold text-lg text-primary">
                ${(item.price_at_time * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                disabled={isLocked}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {item.quantity}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                disabled={isLocked}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateQuantity(item.product_id, 0)}
              disabled={isLocked}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}