import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Leaf, Truck, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/billysBotanicals-hero.png";
import rainbowCarrots from "@/assets/rainbow-carrots.jpg";
import leafyGreens from "@/assets/leafy-greens.jpg";
import tomatoes from "@/assets/tomatoes.jpg";
import bellPeppers from "@/assets/bell-peppers.jpg";
import greenhouse from "@/assets/greenhouse.jpg";
import BoxComparison from "@/components/BoxComparison";

const UnauthenticatedLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center md:bg-center bg-[position:center_20%]"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Get Started with Weekly <span className="text-accent">Farm-Fresh Deliveries</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Join Billy's Botanicals family and experience the freshest hydroponic produce 
            delivered weekly to your doorstep. Sustainable, local, and grown with love since 2018.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="hero" size="xl">
              <Link to="/auth">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="bg-white/10 border-white text-white hover:bg-white hover:text-foreground">
              <Link to="/auth">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">How Billy's Farm Box Works</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Three simple steps to get farm-fresh ingredients delivered to your door
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">1. Customize Your Box</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Choose your box size and select from seasonal produce, local proteins, 
                  and artisan pantry items. Every item is sourced from our hydroponic farm.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">2. Schedule Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Select your preferred delivery day and frequency. We deliver fresh 
                  from our greenhouse to your doorstep every week.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">3. Enjoy Fresh Food</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Unpack your weekly box and discover new seasonal favorites. 
                  Cook with confidence knowing every ingredient is farm-fresh.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Billy's Fresh Picks</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Hand-selected from our hydroponic greenhouse this week
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Rainbow Carrots", description: "Sweet, colorful heirloom varieties", image: rainbowCarrots, badge: "Billy's Favorite" },
              { name: "Leafy Greens Mix", description: "Fresh spinach, arugula, and kale", image: leafyGreens, badge: "From Billy's Greenhouse" },
              { name: "Heritage Tomatoes", description: "Vine-ripened hydroponic varieties", image: tomatoes, badge: "Greenhouse Grown" },
              { name: "Bell Pepper Trio", description: "Red, yellow, and orange peppers", image: bellPeppers, badge: "Seasonal Special" }
            ].map((product, index) => (
              <Card key={index} className="overflow-hidden hover:scale-105 transition-all duration-300">
                <div className="relative aspect-square">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-medium">
                      {product.badge}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm">{product.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Billy's */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Billy's Botanicals?</h2>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-fresh rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">100% Hydroponic & Sustainable</h3>
                    <p className="text-muted-foreground">Our greenhouse uses 95% less water and zero pesticides while producing the freshest vegetables year-round.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-fresh rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Family-Owned Since 2018</h3>
                    <p className="text-muted-foreground">Billy and his family personally grow every vegetable with love and dedication to quality.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-fresh rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Fresh Weekly Delivery</h3>
                    <p className="text-muted-foreground">From harvest to your door in 24 hours. Choose your delivery day and we'll take care of the rest.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img 
                  src={greenhouse} 
                  alt="Billy's hydroponic greenhouse" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <BoxComparison />

      {/* Customer Testimonials */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">What Families Are Saying</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Real stories from families who love Billy's fresh produce
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                location: "Botanical Valley, CA",
                quote: "Billy's hydroponic vegetables are incredible! My kids actually ask for more vegetables now. The freshness is unmatched.",
                rating: 5
              },
              {
                name: "Mike Chen",
                location: "Greenfield, CA", 
                quote: "Supporting Billy's family farm while getting the freshest produce? It's amazing. You can taste the love in every bite.",
                rating: 5
              },
              {
                name: "Elena Rodriguez",
                location: "Valley Springs, CA",
                quote: "Billy's personal notes in each box make it feel like family. Knowing our food is grown with such care means everything.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join Billy's Botanical Family?</h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the freshest hydroponic produce grown with love since 2018.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="organic" size="xl">
              <Link to="/auth">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="bg-white/10 border-white text-white hover:bg-white hover:text-foreground">
              <Link to="/auth">Already a Member? Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UnauthenticatedLanding;