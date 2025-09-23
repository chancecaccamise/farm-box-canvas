import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Leaf, Truck, Users, Star, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/billysBotanicals-hero.png";
import rainbowCarrots from "@/assets/rainbow-carrots.jpg";
import leafyGreens from "@/assets/leafy-greens.jpg";
import tomatoes from "@/assets/tomatoes.jpg";
import bellPeppers from "@/assets/bell-peppers.jpg";
import whychoosebillys from "@/assets/whyChooseBillys.jpg";
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
          Subscribe to Your  <span className="text-accent">Sustenance</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Billy&apos;s Botanicals seasonal Billy's Bags To Go is delivered fresh to your door or available for pickup at the Forsyth Farmer&apos;s Market.
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
          <h2 className="text-4xl font-bold text-center mb-4">Simplify Your Access to Community Produce </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Three simple steps to get farm-fresh ingredients delivered to your door
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">1. Pick Your Produce</CardTitle>
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
          <h2 className="text-4xl font-bold text-center mb-4">Billy's Personal Picks</h2>
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
          <h2 className="text-4xl font-bold text-center mb-16">What sets Billy&apos;s Botanicals apart?</h2>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-fresh rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">100% Sustainable</h3>
                    <p className="text-muted-foreground">Closed-loop aquaponics system is a soil-free growth method sans pesticides or synthetic fertilizers.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-fresh rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Family-Owned Since 2020</h3>
                    <p className="text-muted-foreground">From sow to sale, owners Billy and Ana put their hearts and hands into the entire operation.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-fresh rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Community-loved</h3>
                    <p className="text-muted-foreground">Dedicated to supporting fellow local growers, foragers, and makers in Savannah </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img 
                  src={whychoosebillys} 
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
          <h2 className="text-4xl font-bold text-center mb-4">What Our Community Is Saying</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Real stories from local chefs, customers, and families who choose Billy's Botanicals
          </p>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {[
                {
                  name: "Chef Derek Lark",
                  location: "Marker 107",
                  quote: "Billy's Botanicals is a gem! Their seafood is incredibly fresh and the herbs add such a vibrant kick to our dishes. The quality is unmatched, and the service is always warm and dependable. I highly recommend this local treasure!",
                  rating: 5,
                  type: "chef"
                },
                {
                  name: "Chef Collin Clemons", 
                  location: "1540 Room & Desoto Hotel",
                  quote: "Billy's Botanicals provides the highest quality products in the low-country, hands down. The relationships they have built with fishermen and restaurateurs, not to mention the amazing quality of vegetables and herbs grown on their farm are second to none. We at the DeSoto Hotel and 1540 Room restaurant are beyond proud to provide the highest quality food thanks to Billy.",
                  rating: 5,
                  type: "chef"
                },
                {
                  name: "Jane Fishel",
                  location: "Savannah, GA",
                  quote: "Billy's Botanicals is your one stop shop for produce, seafood, and stunning floral arrangements. Whether you go to the farmers market or get one of their beautifully curated farm bags, it is always fresh and always local!",
                  rating: 5,
                  type: "customer"
                },
                {
                  name: "Rena P",
                  location: "Savannah, GA",
                  quote: "What a privilege to get a weekly delivery from Billy's Botanicals. Want in on the source of the freshest ingredients used by some of your favorite restaurants in Savannah? Where to find local fish? Fresh eggs? Just picked veggies? A bouquet of flowers that lasts a week? And the nicest folks you could ever meet? Billy's Botanicals is calling your name!",
                  rating: 5,
                  type: "customer"
                },
                {
                  name: "Karen G",
                  location: "Billy's Bag Customer",
                  quote: "My family also uses Billy's Botanicals Billy's Bag. It is so enjoyable to have the opportunity to have fresh and sustainably sourced produce and seafood as well as the privilege to support a local business.",
                  rating: 5,
                  type: "customer"
                },
                {
                  name: "Jay H",
                  location: "Savannah, GA",
                  quote: "WE LOVE BILLY'S! From the fresh, local seafood to the produce, eggs, spices and sauces, you can't go wrong! We love Billy's Bags which include proteins, eggs, produce and more letting us eat healthy, fresh and local meals that vary every week depending on what's in season.",
                  rating: 5,
                  type: "customer"
                },
                {
                  name: "Jacob Hammer",
                  location: "Husk Savannah",
                  quote: "Billy's botanicals is something special. From sourcing the freshest seafood to truly home-grown herbs and vegetables, they are the epitome of high quality. Partnerships like theirs are what allow Husk to thrive and be successful. On top of it all, Billy and Ana are two of the kindest people on the planet.",
                  rating: 5,
                  type: "customer"
                },
                {
                  name: "Rachel Matte",
                  location: "Savannah, GA",
                  quote: "I first started ordering the farm bags from Billy's Botanicals during the covid lockdown, when veggies were nowhere to be found. I quickly relied on these weekly deliveries to get the best fresh vegetables. They became my 'Chopped Baskets,' getting to try new things you'd never find in a store like edible flowers, fava beans and spicy radishes, one of my personal favorites. Salads are my go to prep for the week, and these bags give the best variety and ingredients to make new fun flavors in them. Definitely a staple to my grocery list each week.",
                  rating: 5,
                  type: "customer"
                }
              ].map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="text-center h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic flex-grow text-sm leading-relaxed">"{testimonial.quote}"</p>
                      <div className="mt-auto">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-12" />
            <CarouselNext className="hidden sm:flex -right-12" />
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Be nurtured by Billy&apos;s Botanicals</h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the freshest produce grown with love since 2018.
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