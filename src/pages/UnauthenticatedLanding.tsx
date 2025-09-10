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
          <h2 className="text-4xl font-bold text-center mb-4">What Customers Say About Ana's Arrangements</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Real stories from customers who love Ana's floral arrangements
          </p>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {[
                {
                  text: "I have had such wonderful experiences working with Ana at Billy's Botanicals! She is amazing to work with—her communication is always clear and timely, and she truly listens to what couples want for their wedding day. Ana is incredibly talented and creates the most beautiful floral arrangements that can completely transform our venues or add just enough to enhance their natural beauty.",
                  author: "Melanie Marchand - Senior Wedding & Event Specialist, Red Gate Farms",
                  event: "Wedding",
                  rating: 5
                },
                {
                  text: "As a recent bride who loves flowers, I highly recommend Ana's services. Ana completely followed through with the vision I provided for my bouquet. Everything looked cohesive yet unique to where it was placed. Ana not only provided stunning floral arrangements, but also demonstrated professionalism and kindness.",
                  author: "Erin B.",
                  event: "Wedding", 
                  rating: 5
                },
                {
                  text: "We would like to extend our heartfelt thanks to Ana and her team for their wonderful service. All of the florals were fresh, vibrant in color, and thoughtfully arranged to complement our theme. Ana maintained excellent communication with us throughout the planning process, and she even coordinated with our vendors to ensure everything matched perfectly.",
                  author: "Adeina",
                  event: "Wedding",
                  rating: 5
                },
                {
                  text: "Words can't express how grateful we are to have had our dear friend Ana do the flowers for our wedding. My bouquet was a true work of art which brought tears to my eyes as soon as I saw it. The florals at our ceremony were absolutely breathtaking, and the centerpieces at the reception perfectly tied the entire room together.",
                  author: "Libby B.",
                  event: "Wedding",
                  rating: 5
                },
                {
                  text: "Flowers by Ana does a weekly flower arrangement for us at Lavender Hill SpaSalon and the flowers catch every customer's eye. They are beautiful every single week. Each arrangement is unique, interesting and one-of-a-kind; we get so many compliments!",
                  author: "Karen G. at SalonSpa",
                  event: "Other",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Quote className="w-8 h-8 text-accent mb-4 mx-auto" />
                      <p className="text-muted-foreground italic mb-4 flex-grow text-sm">
                        "{testimonial.text}"
                      </p>
                      <div className="mt-auto">
                        <p className="font-semibold text-sm">{testimonial.author}</p>
                        <Badge variant="secondary" className="mt-1">
                          {testimonial.event}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 -translate-x-12" />
            <CarouselNext className="right-0 translate-x-12" />
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