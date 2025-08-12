import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Leaf, Lightbulb, Recycle } from "lucide-react";
import howWeGrowBanner from '@/assets/howWeGrowBanner.png';
import hydroFarm from '@/assets/leftHydroFarm.jpeg';
import hydroFarmHorizontal from '@/assets/hydroFarmHorizontal.jpeg';
import greenhouse from '@/assets/greenhouse.jpg';
import farmPond from '@/assets/farmPond.jpeg';
import hydroFarm2 from '@/assets/hydroFarm2.jpeg';

const HowWeGrow = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-fresh overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img 
          src={howWeGrowBanner} 
          alt="Hydroponic growing system" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Full-circle farming to feed friends and neighbors
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            At the heart of our agricultural practice is a closed-loop aquaponics system: a sustainable, soil-free method that enables us to produce clean, vibrant produce without pesticides or synthetic fertilizers. Every food source you get from us is packed with nutrients and absolutely free of harmful chemicals.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Section 1: Hydroponic System */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Ancient, adaptable methods</h2>
            <h3 className="text-2xl text-muted-foreground mb-8">Growing in Water, Not Soil</h3>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
              Aquaponics unifies the tenets of aquaculture and hydroponics, simultaneously raising fish and produce efficiently, organically, and sustainably. This technique uses 1/3 less amounts of water and land while outputting 3 times as much food per acre as traditional farming.
              </p>
              
              <div className="bg-accent/10 p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-3">Benefits of Hydroponics:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-3">
                    <Droplets className="w-5 h-5 text-accent" />
                    <span>Local fish varieties are nurtured in large tanks where they produce ammonia-rich waste</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Leaf className="w-5 h-5 text-accent" />
                    <span>Bacteria in the adjacent grow beds oxidizes the ammonia into nitrites and eventually nitrates</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    <span>Plants absorb the nitrates as nutrients which acts as a natural fertilizer</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Recycle className="w-5 h-5 text-accent" />
                    <span>The roots from the plants act as a complex water filtration system for the fish</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <img 
                src={hydroFarm}
                alt="Hydroponic lettuce growing" 
                className="rounded-lg shadow-soft w-full h-48 object-cover"
              />
              <img 
                src={farmPond}
                alt="LED grow lights" 
                className="rounded-lg shadow-soft w-full h-48 object-cover"
              />
              <img 
                src={hydroFarmHorizontal} 
                alt="Nutrient monitoring system" 
                className="rounded-lg shadow-soft w-full h-48 object-cover col-span-2"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Sustainable Practices */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Environmental advantages of aquaponics</h2>
            <h3 className="text-2xl text-muted-foreground">Better for you, safer for the planet</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <img 
              src={hydroFarm2} 
              alt="Sustainable farming practices" 
              className="rounded-lg shadow-soft w-full h-80 object-cover"
            />
            
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
              Aquaponics uses 90% less water than conventional soil-based farming by recirculating water, preventing future erosion, runoff, and nutrient loss into surrounding ecosystems. 

              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Droplets className="w-8 h-8 text-accent mx-auto mb-2" />
                    <h4 className="font-semibold">No harmful pesticides</h4>
                    <p className="text-sm text-muted-foreground">100% natural nutrients</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Recycle className="w-8 h-8 text-accent mx-auto mb-2" />
                    <h4 className="font-semibold">Symbiotic cultivation</h4>
                    <p className="text-sm text-muted-foreground">Healthy fish and produce</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Why It Matters */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-8">Year-round production</h2>
            <p>Aquaponic environments allow us to produce reliably regardless of season or weather, ensuring consistent local supply for our community.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <Leaf className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Reliable</h3>
                <p className="text-muted-foreground">
                Nutrient-rich fare regardless of season
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <Droplets className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Fresh</h3>
                <p className="text-muted-foreground">
                Picked and packed within days of delivery
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <Recycle className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Hyper-local</h3>
                <p className="text-muted-foreground">
                Cultivated for the community, by the community
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-accent/10 p-8 rounded-lg text-center">
            <blockquote className="text-xl italic mb-4">
              "Quote from customer"
            </blockquote>
            <cite className="text-muted-foreground">— Sarah M., Happy Customer</cite>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowWeGrow;