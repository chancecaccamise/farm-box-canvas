import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, Calendar } from "lucide-react";

const MyBag = () => {
  const [bagItems, setBagItems] = useState([
    { id: 1, name: "Organic Rainbow Carrots", price: 4.50, quantity: 2, category: "Produce", source: "Sunshine Farm" },
    { id: 2, name: "Leafy Greens Mix", price: 6.00, quantity: 1, category: "Produce", source: "Green Valley Farm" },
    { id: 3, name: "Heritage Tomatoes", price: 5.25, quantity: 3, category: "Produce", source: "Sunset Acres" },
    { id: 4, name: "Free-Range Eggs", price: 7.00, quantity: 1, category: "Protein", source: "Happy Hens Farm" },
    { id: 5, name: "Local Honey", price: 12.00, quantity: 1, category: "Pantry", source: "Mountain Bee Co." },
    { id: 6, name: "Artisan Bread", price: 8.50, quantity: 1, category: "Pantry", source: "Village Bakery" }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setBagItems(bagItems.filter(item => item.id !== id));
    } else {
      setBagItems(bagItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id: number) => {
    setBagItems(bagItems.filter(item => item.id !== id));
  };

  const subtotal = bagItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = bagItems.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Produce": return "bg-green-100 text-green-800";
      case "Protein": return "bg-orange-100 text-orange-800";
      case "Pantry": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Bag Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">My Bag</h1>
                <p className="text-muted-foreground">{totalItems} items for this week's delivery</p>
              </div>
            </div>

            {/* Bag Items */}
            <div className="space-y-4">
              {bagItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">from {item.source}</p>
                          </div>
                          <Badge variant="secondary" className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
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

            {bagItems.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your bag is empty</h3>
                  <p className="text-muted-foreground mb-6">Add some fresh items to get started</p>
                  <Button>Browse Products</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Summary */}
          <div className="space-y-6">
            {/* Weekly Total */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Weekly Total</span>
                </CardTitle>
                <CardDescription>Delivery scheduled for Friday</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Items ({totalItems})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Box fee</span>
                    <span>$3.00</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(subtotal + 3).toFixed(2)}</span>
                </div>

                <Button className="w-full" size="lg" disabled={bagItems.length === 0}>
                  Confirm This Week's Box
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You can modify your selections until Wednesday at 11:59 PM
                </p>
              </CardContent>
            </Card>

            {/* Contents Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Contents Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Produce items</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {bagItems.filter(item => item.category === "Produce").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Protein items</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {bagItems.filter(item => item.category === "Protein").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pantry items</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {bagItems.filter(item => item.category === "Pantry").length}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">🌱 All produce is locally sourced</p>
                  <p className="mb-2">🥩 Proteins are hormone-free</p>
                  <p>📦 Packaging is 100% compostable</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBag;