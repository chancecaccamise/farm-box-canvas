import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Truck, ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

const Confirmation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        {/* Main Message */}
        <h1 className="text-4xl font-bold mb-4">Your Farm Box is On Its Way!</h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-lg mx-auto">
          Thank you for choosing fresh, local ingredients. We're excited to deliver 
          amazing food right to your doorstep.
        </p>

        {/* Order Details Card */}
        <Card className="mb-8 shadow-medium text-left">
          <CardHeader>
            <CardTitle>Order Confirmation</CardTitle>
            <CardDescription>Here's what happens next</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Next Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Thursday, January 18th<br />
                    Between 8 AM - 12 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Delivery Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll text you when your box<br />
                    is packed and on the way
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">📦 Your Box Contains</h4>
              <p className="text-sm text-muted-foreground">
                12 carefully selected fresh items plus 3 premium add-ons, 
                all sourced from local farms and artisan producers.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-8 shadow-soft">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">What's Next?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">1</div>
                <p className="font-medium">We Pack Your Box</p>
                <p className="text-muted-foreground">Fresh from the farm the night before delivery</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">2</div>
                <p className="font-medium">Out for Delivery</p>
                <p className="text-muted-foreground">You'll get a text when it's on the way</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">3</div>
                <p className="font-medium">Enjoy Fresh Food</p>
                <p className="text-muted-foreground">Unpack and start cooking amazing meals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" asChild>
            <Link to="/product-selection">
              Customize Next Box
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Questions? Contact our team at hello@farmbox.com or (555) 123-4567
        </p>
      </div>
    </div>
  );
};

export default Confirmation;