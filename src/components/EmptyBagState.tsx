import { ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyBagStateProps {
  onStartShopping: () => void;
}

export function EmptyBagState({ onStartShopping }: EmptyBagStateProps) {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardContent className="pt-12 pb-12">
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-foreground">
              Your bag is empty
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start building your weekly farm box by adding fresh, local products below.
            </p>
          </div>

          <Button size="lg" onClick={onStartShopping}>
            <Plus className="w-4 h-4 mr-2" />
            Start Shopping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}