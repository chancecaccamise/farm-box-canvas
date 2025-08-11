import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Leaf, Truck, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function StartFarmBoxJourney() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Leaf className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Start Your Farm Box Journey
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get fresh, locally-sourced produce delivered straight to your door. 
          Support local farmers while enjoying the best seasonal ingredients.
        </p>
      </div>

      {/* Benefits Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Farm Fresh</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Handpicked produce from local farms, harvested at peak freshness for maximum flavor and nutrition.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Convenient Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Weekly deliveries straight to your doorstep. Choose your preferred delivery day and let us handle the rest.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-lg">Support Local</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Every box directly supports local farmers and sustainable agriculture in your community.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-8">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Choose your box size and customize your weekly selection. 
              You can always modify your preferences later.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                <Link to="/box-selection">
                  Choose Your Box Size
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link to="/how-farm-bags-work">
                  Learn How It Works
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>No commitment required • Skip or pause anytime • Cancel whenever you want</p>
        <p>Starting from $24.99/week with free delivery on orders over $35</p>
      </div>
    </div>
  );
}