import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Repeat, ShoppingBag, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCheckout } from "@/contexts/CheckoutContext";
import { supabase } from "@/integrations/supabase/client";

type BoxType = "one-time" | "subscription";
type BoxSize = "small" | "medium" | "large";

const BoxSelection = () => {
  const { checkoutState, updateBoxType, updateBoxSize } = useCheckout();
  const [boxType, setBoxType] = useState<BoxType>(checkoutState.boxType);
  const [boxSize, setBoxSize] = useState<BoxSize>(checkoutState.boxSize || "small");
  const [boxSizes, setBoxSizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    updateBoxType(boxType);
    updateBoxSize(boxSize);
  }, [boxType, boxSize, updateBoxType, updateBoxSize]);

  useEffect(() => {
    fetchBoxSizes();
  }, []);

  const fetchBoxSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('box_sizes')
        .select('*')
        .eq('is_active', true)
        .order('base_price', { ascending: true });

      if (error) throw error;
      setBoxSizes(data || []);
    } catch (error) {
      console.error('Error fetching box sizes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/add-ons");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/account">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
          </div>
          <span className="ml-4 text-sm text-muted-foreground">Step 3 of 3</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Box</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your box type and size to get started with fresh, local ingredients
          </p>
        </div>

        {/* Box Type Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Box Type</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                boxType === "subscription" 
                  ? "ring-2 ring-primary shadow-medium" 
                  : "hover:shadow-medium"
              }`}
              onClick={() => setBoxType("subscription")}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <Repeat className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  Subscription
                  <Badge variant="secondary">Recommended</Badge>
                </CardTitle>
                {boxType === "subscription" && (
                  <CheckCircle className="w-6 h-6 text-primary mx-auto" />
                )}
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Weekly deliveries of fresh ingredients. Cancel or pause anytime.
                  Perfect for regular meal planning.
                </CardDescription>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                boxType === "one-time" 
                  ? "ring-2 ring-primary shadow-medium" 
                  : "hover:shadow-medium"
              }`}
              onClick={() => setBoxType("one-time")}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <CardTitle>One-Time Box</CardTitle>
                {boxType === "one-time" && (
                  <CheckCircle className="w-6 h-6 text-primary mx-auto" />
                )}
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Try our farm box once. Great for special occasions or 
                  testing out our service.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Box Size Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Box Size</h2>
          {loading ? (
            <div className="text-center">Loading box sizes...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {boxSizes.map((size) => (
                <Card 
                  key={size.name}
                  className={`cursor-pointer transition-all duration-300 ${
                    boxSize === size.name 
                      ? "ring-2 ring-primary shadow-medium" 
                      : "hover:shadow-medium"
                  }`}
                  onClick={() => setBoxSize(size.name as BoxSize)}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="flex items-center justify-center gap-2">
                      {size.display_name}
                      {size.name === 'medium' && <Badge variant="secondary">Popular</Badge>}
                    </CardTitle>
                    {boxSize === size.name && (
                      <CheckCircle className="w-6 h-6 text-primary mx-auto" />
                    )}
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">${size.base_price}</div>
                    <div className="text-lg font-medium mb-2">{size.item_count_range}</div>
                    <CardDescription className="text-base">{size.serves_text}</CardDescription>
                    {size.description && (
                      <CardDescription className="text-sm mt-2">{size.description}</CardDescription>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <Card className="mb-8 shadow-medium">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Selection</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Box Type:</span>
                <span className="ml-2 font-medium capitalize">{boxType.replace("-", " ")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Box Size:</span>
                <span className="ml-2 font-medium">
                  {boxSizes.find(s => s.name === boxSize)?.display_name} 
                  ({boxSizes.find(s => s.name === boxSize)?.item_count_range})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            variant="hero"
            size="xl"
            className="w-full md:w-auto"
          >
            Continue to Add-ons
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BoxSelection;