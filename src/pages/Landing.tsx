import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Leaf, Truck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farm-box.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-60"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-6xl font-bold mb-6 tracking-tight">
            Farm Fresh. <span className="text-accent">Weekly Delivered.</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover the freshest seasonal produce, local proteins, and artisan pantry items. 
            Customize your weekly farm box and taste the difference.
          </p>
          <Button asChild variant="hero" size="xl">
            <Link to="/zip-code">Start Your Weekly Farm Box</Link>
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Three simple steps to get farm-fresh ingredients delivered to your door
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Customize Your Box</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Choose your box size and select from seasonal produce, local proteins, 
                  and artisan pantry items. Every item is sourced from local farms.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Choose Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Select your preferred delivery day and frequency. We deliver fresh 
                  from the farm to your doorstep every week.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Enjoy Fresh Food</CardTitle>
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
          <h2 className="text-4xl font-bold text-center mb-4">This Week's Harvest</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Fresh seasonal picks from our partner farms
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Rainbow Carrots", description: "Sweet, colorful heirloom varieties", image: "🥕" },
              { name: "Leafy Greens Mix", description: "Fresh spinach, arugula, and kale", image: "🥬" },
              { name: "Heritage Tomatoes", description: "Vine-ripened local varieties", image: "🍅" },
              { name: "Bell Pepper Trio", description: "Red, yellow, and orange peppers", image: "🫑" }
            ].map((product, index) => (
              <Card key={index} className="overflow-hidden hover:scale-105 transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center text-6xl">
                  {product.image}
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

      {/* Email Collection Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Stay Fresh with Weekly Updates</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get first access to seasonal harvests, exclusive recipes, and farm stories delivered to your inbox every week.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <Button type="submit" size="lg" className="px-8">
                  Subscribe
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Join 2,000+ families already enjoying fresh updates. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">What Our Customers Say</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Real stories from families who love their weekly farm boxes
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                location: "Berkeley, CA",
                quote: "The quality is incredible! My kids actually ask for more vegetables now. The seasonal variety keeps our meals exciting.",
                rating: 5
              },
              {
                name: "Mike Chen",
                location: "Oakland, CA", 
                quote: "Supporting local farmers while getting the freshest produce? It's a win-win. The convenience is unmatched.",
                rating: 5
              },
              {
                name: "Elena Rodriguez",
                location: "San Francisco, CA",
                quote: "I love knowing exactly where my food comes from. The farmer stories in each box make it feel so personal.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-accent text-lg">★</span>
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

      {/* Farm Partnerships */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Supporting Local Farms</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We partner with over 20 local farms within 150 miles of your home. Every box supports 
                sustainable agriculture and keeps farming families thriving in our community.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">20+</div>
                  <div className="text-sm text-muted-foreground">Partner Farms</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">150</div>
                  <div className="text-sm text-muted-foreground">Mile Radius</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">90%</div>
                  <div className="text-sm text-muted-foreground">Organic Certified</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">52</div>
                  <div className="text-sm text-muted-foreground">Weeks Fresh</div>
                </div>
              </div>
              
              <Button asChild variant="outline" size="lg">
                <Link to="/meet-farmers">Meet Our Farmers</Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-accent/30 to-accent/10 rounded-2xl flex items-center justify-center text-8xl">
                🚜
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Farm Box Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families enjoying the freshest local produce every week.
          </p>
          <Button asChild variant="organic" size="xl">
            <Link to="/zip-code">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;