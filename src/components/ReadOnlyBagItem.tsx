
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface ReadOnlyBagItemProps {
  item: BagItem;
  partnerName?: string;
}

export function ReadOnlyBagItem({ item, partnerName }: ReadOnlyBagItemProps) {
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
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return image;
    return `/src/assets/${image}`;
  };

  const getCategoryFallback = (category: string) => {
    const fallbacks = {
      produce: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
      herbs: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop',
      seafood: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=400&fit=crop',
      pantry: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
      protein: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd02?w=400&h=400&fit=crop'
    };
    return fallbacks[category.toLowerCase() as keyof typeof fallbacks] || fallbacks.produce;
  };

  const imageSrc = getImageSrc(item.products.image) || getCategoryFallback(item.products.category);

  return (
    <Card className="overflow-hidden border-muted/30">
      <div className="aspect-square relative overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.products.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== getCategoryFallback(item.products.category)) {
                target.src = getCategoryFallback(item.products.category);
              } else {
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        <div 
          className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center"
          style={{ display: imageSrc ? 'none' : 'flex' }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🥬</div>
            <span className="text-sm text-muted-foreground">Fresh Product</span>
          </div>
        </div>
        
        <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm shadow-soft">
          {item.quantity}x
        </Badge>

        <Badge 
          variant="secondary" 
          className={`absolute top-3 left-3 ${getCategoryColor(item.products.category)} backdrop-blur-sm shadow-soft`}
        >
          {item.products.category}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.products.name}</h3>
          <p className="text-sm text-muted-foreground">
            From {partnerName || "Billy's Farm"}
          </p>
          <p className="text-sm font-medium text-primary">
            {item.quantity} {item.quantity === 1 ? 'serving' : 'servings'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
