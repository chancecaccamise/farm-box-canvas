import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Leaf, Truck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/billys-botanicals-hero.jpg";
import rainbowCarrots from "@/assets/rainbow-carrots.jpg";
import leafyGreens from "@/assets/leafy-greens.jpg";
import tomatoes from "@/assets/tomatoes.jpg";
import bellPeppers from "@/assets/bell-peppers.jpg";

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
            Billy's Fresh. <span className="text-accent">Grown with Love.</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Welcome to Billy's Botanicals! Family-owned since 2018, we grow the freshest hydroponic produce 
            and deliver it weekly to your doorstep. Experience the difference of sustainable agriculture.
          </p>
          <Button asChild variant="hero" size="xl">
            <Link to="/zip-code">Join Billy's Botanical Family</Link>
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

      {/* Email Collection Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Join Billy's Botanical Family</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get Billy's weekly growing tips, first access to seasonal harvests, and exclusive farm stories delivered to your inbox.
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
                Join 1,500+ families in Billy's Botanical community. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">What Billy's Family Says</h2>
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
              <h2 className="text-4xl font-bold mb-6">Billy's Sustainable Growing</h2>
              <p className="text-lg text-muted-foreground mb-6">
                From our state-of-the-art hydroponic greenhouse to your table. Billy's commitment to 
                sustainable agriculture means fresher produce with minimal environmental impact.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">2018</div>
                  <div className="text-sm text-muted-foreground">Family Founded</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Water Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Pesticide Free</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">52</div>
                  <div className="text-sm text-muted-foreground">Weeks Growing</div>
                </div>
              </div>
              
              <Button asChild variant="outline" size="lg">
                <Link to="/meet-farmers">Meet Billy & The Team</Link>
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
          <h2 className="text-4xl font-bold mb-6">Ready to Join Billy's Botanical Family?</h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the freshest hydroponic produce grown with love since 2018.
          </p>
          <Button asChild variant="organic" size="xl">
            <Link to="/zip-code">Start Your Billy's Box Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;