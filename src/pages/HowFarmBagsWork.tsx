import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Calendar, Truck, Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const HowFarmBagsWork = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-primary text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">How Farm Bags Work</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            From farm selection to your doorstep, discover how we bring the freshest seasonal produce 
            directly to your kitchen every week.
          </p>
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-lg px-6 py-2">
              🌱 Fresh • Local • Sustainable
            </Badge>
          </div>
        </div>
      </section>

      {/* Step-by-Step Process */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Your Farm Box Journey</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Follow your fresh produce from local farms to your table in five simple steps
          </p>
          
          <div className="grid lg:grid-cols-5 gap-8">
            {[
              {
                step: "01",
                title: "Farm Selection",
                description: "We partner with certified local farms that practice sustainable agriculture",
                icon: <Package className="w-8 h-8" />,
                color: "bg-gradient-fresh"
              },
              {
                step: "02", 
                title: "Fresh Harvest",
                description: "Produce is harvested at peak ripeness just days before delivery",
                icon: <CheckCircle className="w-8 h-8" />,
                color: "bg-gradient-fresh"
              },
              {
                step: "03",
                title: "Quality Check",
                description: "Every item is inspected for freshness, quality, and organic standards",
                icon: <Shield className="w-8 h-8" />,
                color: "bg-gradient-fresh"
              },
              {
                step: "04",
                title: "Custom Packing",
                description: "Your personalized box is carefully packed with your selected items",
                icon: <Settings className="w-8 h-8" />,
                color: "bg-gradient-fresh"
              },
              {
                step: "05",
                title: "Doorstep Delivery",
                description: "Fresh produce arrives at your door on your chosen delivery day",
                icon: <Truck className="w-8 h-8" />,
                color: "bg-gradient-fresh"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                  {step.icon}
                </div>
                <div className="text-sm font-bold text-accent mb-2">STEP {step.step}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customization Options */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Customize Your Perfect Box</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Tailor your farm box to match your family's preferences and dietary needs
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🥬</span>
                </div>
                <CardTitle className="text-2xl">Box Size</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Choose from Small (2-3 people), Medium (4-5 people), or Large (6+ people) boxes
                </CardDescription>
                <div className="space-y-2">
                  <Badge variant="outline">Small - $25/week</Badge>
                  <Badge variant="outline">Medium - $40/week</Badge>
                  <Badge variant="outline">Large - $55/week</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🍅</span>
                </div>
                <CardTitle className="text-2xl">Product Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Select your preferences for vegetables, fruits, herbs, and specialty items
                </CardDescription>
                <div className="space-y-2">
                  <Badge variant="outline">Vegetables Only</Badge>
                  <Badge variant="outline">Mixed Produce</Badge>
                  <Badge variant="outline">Add Proteins</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🌿</span>
                </div>
                <CardTitle className="text-2xl">Dietary Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Accommodate allergies, dietary restrictions, and personal preferences
                </CardDescription>
                <div className="space-y-2">
                  <Badge variant="outline">Organic Only</Badge>
                  <Badge variant="outline">No Nightshades</Badge>
                  <Badge variant="outline">Vegan Options</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scheduling & Delivery */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Flexible Scheduling</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Manage your subscription with complete flexibility. Skip weeks when you're traveling, 
                pause for vacations, or adjust your delivery schedule anytime.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-fresh rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Weekly Delivery</h3>
                    <p className="text-muted-foreground">Choose from Tuesday, Thursday, or Saturday delivery slots</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-fresh rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
                    <p className="text-muted-foreground">Skip, pause, or modify your subscription anytime online</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-fresh rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Contactless Delivery</h3>
                    <p className="text-muted-foreground">Safe, contactless delivery with insulated, reusable bags</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-6xl mb-6">📦</div>
                <h3 className="text-2xl font-bold mb-4">Your Box Includes</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>5-8 seasonal vegetables</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>2-3 fresh fruits</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>Fresh herbs & greens</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>Recipe cards & storage tips</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>Producer information</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Quality Guarantee</h2>
          <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto">
            We're committed to delivering the highest quality produce. If you're not completely satisfied 
            with any item, we'll make it right.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Freshness Guaranteed</h3>
              <p className="opacity-90">Every item is guaranteed fresh or we'll replace it for free</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Organic Certified</h3>
              <p className="opacity-90">All produce meets strict organic certification standards</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sustainable Packaging</h3>
              <p className="opacity-90">Eco-friendly, reusable, and compostable packaging materials</p>
            </div>
          </div>
          
          <div className="mt-12">
            <Button asChild variant="organic" size="xl">
              <Link to="/zip-code">Start Your Farm Box Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowFarmBagsWork;