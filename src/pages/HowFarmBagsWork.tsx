import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Calendar, Truck, Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import greenhouse from "@/assets/greenhouse.jpg";
import leafyGreens from "@/assets/leafy-greens.jpg";
import tomatoes from "@/assets/tomatoes.jpg";
import bellPeppers from "@/assets/bell-peppers.jpg";

const HowFarmBagsWork = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 bg-cover bg-center"
        style={{ backgroundImage: `url(${greenhouse})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-white">How Billy's Boxes Work</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
            From Billy's hydroponic greenhouse to your doorstep, discover how we bring the freshest produce 
            directly to your kitchen every week with love and care.
          </p>
          <div className="flex justify-center">
            <Badge variant="outline" className="text-lg px-6 py-2 bg-white/10 text-white border-white">
              🌱 Fresh • Hydroponic • Family-Owned Since 2018
            </Badge>
          </div>
        </div>
      </section>

      {/* Step-by-Step Process */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Your Farm Bag Journey</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Follow your fresh produce from Billy's greenhouse to your table in five simple steps
          </p>
          
          <div className="grid lg:grid-cols-5 gap-8">
            {[
              {
                step: "01",
                title: "Hydroponic Growing",
                description: "Billy personally tends to our sustainable hydroponic greenhouse year-round",
                icon: <Package className="w-8 h-8" />,
                color: "bg-gradient-fresh"
              },
              {
                step: "02", 
                title: "Peak Harvest",
                description: "Produce is harvested at perfect ripeness, often the same day as delivery",
                icon: <CheckCircle className="w-8 h-8" />,
                color: "bg-gradient-fresh"
              },
              {
                step: "03",
                title: "Billy's Quality Check",
                description: "Billy personally inspects every item for freshness and quality standards",
                icon: <Shield className="w-8 h-8" />,
                color: "bg-gradient-fresh"
              },
              {
                step: "04",
                title: "Loving Care Packing",
                description: "Your box is hand-packed by Billy's team with care and personal notes",
                icon: <Settings className="w-8 h-8" />,
                color: "bg-gradient-fresh"
              },
              {
                step: "05",
                title: "Fresh Delivery",
                description: "Your Billy's box arrives fresh at your door with a smile",
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
          <h2 className="text-4xl font-bold text-center mb-4">Choose Your Box Size</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Billy curates each box with the freshest seasonal produce. Simply choose your size and add any extras!
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
                  <Badge variant="outline">Small - $35/week</Badge>
                  <Badge variant="outline">Medium - $50/week</Badge>
                  <Badge variant="outline">Large - $70/week</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🍅</span>
                </div>
                <CardTitle className="text-2xl">Billy's Curation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Billy personally selects the best seasonal produce from his greenhouse for each box
                </CardDescription>
                <div className="space-y-2">
                  <Badge variant="outline">Fresh Vegetables</Badge>
                  <Badge variant="outline">Seasonal Herbs</Badge>
                  <Badge variant="outline">Premium Quality</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🌿</span>
                </div>
                <CardTitle className="text-2xl">Add-On Options</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Enhance your box with fresh fish, proteins, and other local specialties
                </CardDescription>
                <div className="space-y-2">
                  <Badge variant="outline">Fresh Fish</Badge>
                  <Badge variant="outline">Local Proteins</Badge>
                  <Badge variant="outline">Extra Produce</Badge>
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
              <h2 className="text-4xl font-bold mb-6">Flexible Family Schedule</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Billy understands family life! Skip weeks when you're traveling, 
                pause for vacations, or adjust your delivery schedule anytime - no hassle.
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
            
            <div 
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: `url(${greenhouse})` }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Billy's Promise</h2>
          <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto">
            Billy personally stands behind every box. If you're not completely satisfied 
            with any item, Billy will make it right - that's the Billy's Botanicals guarantee.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Billy's Freshness Promise</h3>
              <p className="opacity-90">Every item is guaranteed fresh or Billy will replace it personally</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pesticide-Free Growing</h3>
              <p className="opacity-90">100% pesticide-free hydroponic growing in Billy's greenhouse</p>
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
              <Link to="/auth">Start Your Farm Bag Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowFarmBagsWork;