import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Leaf } from "lucide-react";

const MyPlan = () => {
  const [preferences, setPreferences] = useState({
    organic: true,
    noFish: false,
    localOnly: true,
    vegetarian: false,
    glutenFree: false
  });

  const [boxesPerWeek, setBoxesPerWeek] = useState("1");
  const [promoCode, setPromoCode] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Preferences */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Plan</h1>
              <p className="text-muted-foreground">Customize your weekly farm box preferences</p>
            </div>

            {/* Dietary Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="w-5 h-5 text-accent" />
                  <span>Dietary Preferences</span>
                </CardTitle>
                <CardDescription>
                  Choose your preferences to customize your weekly selections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="organic">Organic Only</Label>
                    <p className="text-sm text-muted-foreground">Only certified organic produce</p>
                  </div>
                  <Switch 
                    id="organic"
                    checked={preferences.organic}
                    onCheckedChange={(checked) => setPreferences({...preferences, organic: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="no-fish">No Fish</Label>
                    <p className="text-sm text-muted-foreground">Exclude all fish and seafood</p>
                  </div>
                  <Switch 
                    id="no-fish"
                    checked={preferences.noFish}
                    onCheckedChange={(checked) => setPreferences({...preferences, noFish: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="local-only">Local Only</Label>
                    <p className="text-sm text-muted-foreground">Products sourced within 100 miles</p>
                  </div>
                  <Switch 
                    id="local-only"
                    checked={preferences.localOnly}
                    onCheckedChange={(checked) => setPreferences({...preferences, localOnly: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vegetarian">Vegetarian</Label>
                    <p className="text-sm text-muted-foreground">No meat or fish products</p>
                  </div>
                  <Switch 
                    id="vegetarian"
                    checked={preferences.vegetarian}
                    onCheckedChange={(checked) => setPreferences({...preferences, vegetarian: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gluten-free">Gluten Free</Label>
                    <p className="text-sm text-muted-foreground">No gluten-containing products</p>
                  </div>
                  <Switch 
                    id="gluten-free"
                    checked={preferences.glutenFree}
                    onCheckedChange={(checked) => setPreferences({...preferences, glutenFree: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Frequency */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Frequency</CardTitle>
                <CardDescription>How many boxes would you like per week?</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={boxesPerWeek} onValueChange={setBoxesPerWeek}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select boxes per week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 box per week</SelectItem>
                    <SelectItem value="2">2 boxes per week</SelectItem>
                    <SelectItem value="3">3 boxes per week</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Medium Box</span>
                    <span>$45.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>8-10 items</span>
                    <span>x{boxesPerWeek}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(45 * parseInt(boxesPerWeek)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(45 * parseInt(boxesPerWeek)).toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promo">Promo Code</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="promo"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resume and Select Items
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Next delivery: This Friday
                </div>
              </CardContent>
            </Card>

            {/* Active Preferences Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {preferences.organic && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Organic Only</span>
                    </div>
                  )}
                  {preferences.localOnly && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Local Only</span>
                    </div>
                  )}
                  {preferences.noFish && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>No Fish</span>
                    </div>
                  )}
                  {preferences.vegetarian && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Vegetarian</span>
                    </div>
                  )}
                  {preferences.glutenFree && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Gluten Free</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPlan;