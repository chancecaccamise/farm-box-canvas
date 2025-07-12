import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Leaf, Eye, Gift } from "lucide-react";

const OurMission = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-fresh overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img 
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=600&fit=crop" 
          alt="Farm team working together" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our Mission: Growing Quality, Supporting Community
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              At FarmBox, we are dedicated to providing you with the best locally sourced, 
              sustainably grown food. Our mission is not only to nourish you with fresh, 
              healthy produce but to support local farmers and promote environmentally 
              conscious living.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Section 1: Core Values */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <h3 className="text-2xl text-muted-foreground">What Drives Us</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover-scale text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
                <p className="text-muted-foreground">
                  We prioritize environmentally responsible farming practices that 
                  protect our planet for future generations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-scale text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community Support</h3>
                <p className="text-muted-foreground">
                  Building strong relationships with local farmers, fishermen, 
                  and community members to create a thriving local economy.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-scale text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Freshness & Quality</h3>
                <p className="text-muted-foreground">
                  Delivering the highest quality, freshest produce by harvesting 
                  at peak ripeness and minimizing time from farm to table.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-scale text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Transparency</h3>
                <p className="text-muted-foreground">
                  Open communication about our farming practices, sourcing, 
                  and processes so you know exactly where your food comes from.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 2: Supporting Local Farmers */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-8">Supporting Local Farmers</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                We collaborate with local farmers and fishermen to source the freshest 
                ingredients possible. By working with small-scale farms and independent 
                fishers, we ensure that every box supports our local economy.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Direct Partnerships</h4>
                    <p className="text-muted-foreground">
                      We work directly with local farmers, cutting out middlemen to ensure 
                      fair prices and fresher produce.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Seasonal Sourcing</h4>
                    <p className="text-muted-foreground">
                      Our boxes reflect what's in season locally, supporting natural 
                      growing cycles and peak flavors.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Economic Impact</h4>
                    <p className="text-muted-foreground">
                      Every purchase helps sustain local farming families and keeps 
                      our rural communities thriving.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <img 
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=500&fit=crop" 
              alt="Local farmers working in the field" 
              className="rounded-lg shadow-soft w-full h-96 object-cover"
            />
          </div>
        </section>

        {/* Section 3: Making a Difference */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-8">Making a Difference</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <img 
              src="https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&h=400&fit=crop" 
              alt="Community food donation" 
              className="rounded-lg shadow-soft w-full h-80 object-cover order-2 lg:order-1"
            />
            
            <div className="space-y-6 order-1 lg:order-2">
              <p className="text-lg leading-relaxed">
                We believe in sharing our success. We donate a portion of our profits 
                to community food banks and support local food initiatives that help 
                ensure everyone has access to fresh, healthy food.
              </p>
              
              <div className="bg-accent/10 p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-4 flex items-center">
                  <Gift className="w-5 h-5 text-accent mr-2" />
                  Our Community Impact
                </h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-accent">2,500+</div>
                    <div className="text-sm text-muted-foreground">Meals Donated</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">15</div>
                    <div className="text-sm text-muted-foreground">Partner Farms</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">8</div>
                    <div className="text-sm text-muted-foreground">Food Banks Supported</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">100%</div>
                    <div className="text-sm text-muted-foreground">Local Sourced</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/10 p-6 rounded-lg">
                <blockquote className="text-lg italic mb-4">
                  "FarmBox's support has been incredible for our food bank. Their fresh 
                  produce donations help us provide healthy options to families in need."
                </blockquote>
                <cite className="text-muted-foreground">
                  — Maria Rodriguez, Director, Valley Community Food Bank
                </cite>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OurMission;