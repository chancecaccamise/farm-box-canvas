
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Leaf, Truck, Users, Star } from "lucide-react";
import heroImage from "@/assets/billysBotanicals-hero.png";
import BoxComparison from "@/components/BoxComparison";
import FreshAddOns from "@/components/FreshAddOns";

const Landing = () => {

  const scrollToBoxes = () => {
    const boxSection = document.getElementById('box-comparison');
    if (boxSection) {
      boxSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          Subscribe to Your <span className="text-accent">Sustenance.</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Billy&apos;s Botanicals seasonal Billy's Box To Go is delivered fresh to your door or available for pickup at the Forsyth Farmer&apos;s Market.
          </p>
          <Button onClick={scrollToBoxes} variant="hero" size="xl">
            View Subscription Options
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simplify Your Access to Community Produce</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Three simple steps to get fresh, curated ingredients delivered weekly
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">1. Choose Your Box Size</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Select Small, Medium, or Large based on your household size. 
                  Each box is the perfect amount for your family.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">2. We Curate Your Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Billy and his team handpick the freshest produce, local fish, 
                  and artisan goods based on seasonal harvests.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">3. Delivered Fresh</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your curated box arrives fresh at your doorstep every week. 
                  
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Box Comparison Section */}
      <div id="box-comparison">
        <BoxComparison />
      </div>

      {/* Fresh Add-Ons Section */}
      <FreshAddOns />

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">What sets Billy&apos;s Botanicals apart?</h2>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">100% Local Sourcing</h3>
                    <p className="text-muted-foreground">From Billy's hydroponic farm and trusted local partners including fishermen and artisan bakers.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Sustainable Hydroponic Farming</h3>
                    <p className="text-muted-foreground">Our greenhouse uses 95% less water and zero pesticides while producing the freshest vegetables year-round.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Direct Partnerships</h3>
                    <p className="text-muted-foreground">We work directly with small vendors and local fishermen to bring you the freshest seasonal offerings.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    
                    <p className="text-muted-foreground">Complete flexibility with your subscription. No long-term commitments or cancellation fees.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Transparent Sourcing</h3>
                    <p className="text-muted-foreground">Family-owned since 2018, we know every farmer, fisherman, and baker we work with personally.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Billy's hydroponic greenhouse operation" 
                className="w-full h-full object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">What Families Are Saying</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Real stories from families who love their weekly Billy's boxes
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                location: "Botanical Valley, CA",
                quote: "The weekly boxes are incredible! Billy curates the perfect mix each week. My kids now ask for more vegetables and we discover new favorites constantly.",
                rating: 5
              },
              {
                name: "Mike Chen",
                location: "Greenfield, CA", 
                quote: "The convenience and freshness is unmatched. Having our weekly box delivered means we always have fresh, local ingredients without the meal planning stress.",
                rating: 5
              },
              {
                name: "Elena Rodriguez",
                location: "Valley Springs, CA",
                quote: "Billy's personal touch makes each delivery special. The fresh fish add-ons and seasonal surprises make every week feel like a gift from the farm.",
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
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Weekly Deliveries?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join Billy's Botanical family and experience the freshest curated boxes delivered weekly.
          </p>
          <Button onClick={scrollToBoxes} variant="organic" size="xl">
            Choose Your Box Size
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
