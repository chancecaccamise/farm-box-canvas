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
              Grown with care, harvested fresh for you.
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              At FarmBox, we use hydroponic gardening techniques to grow fresh produce that is 
              environmentally sustainable and free from harmful chemicals. Our system allows for 
              year-round harvesting with a smaller carbon footprint, ensuring that your food is 
              both fresh and responsibly sourced.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Section 1: Hydroponic System */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Hydroponic Growing System</h2>
            <h3 className="text-2xl text-muted-foreground mb-8">Growing in Water, Not Soil</h3>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                We use nutrient-rich water and LED lighting to help plants grow in a soil-free 
                environment, providing them with all the necessary nutrients for healthy, 
                vibrant produce.
              </p>
              
              <div className="bg-accent/10 p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-3">Benefits of Hydroponics:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-3">
                    <Droplets className="w-5 h-5 text-accent" />
                    <span>Uses 90% less water than traditional farming</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Leaf className="w-5 h-5 text-accent" />
                    <span>Eliminates the need for pesticides</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    <span>Year-round growing capability</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Recycle className="w-5 h-5 text-accent" />
                    <span>Faster growth and higher yields</span>
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
            <h2 className="text-4xl font-bold mb-4">Sustainable Practices</h2>
            <h3 className="text-2xl text-muted-foreground">From Seed to Box, We Care About Sustainability</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <img 
              src={hydroFarm2} 
              alt="Sustainable farming practices" 
              className="rounded-lg shadow-soft w-full h-80 object-cover"
            />
            
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                We believe that sustainability is at the heart of what we do. From compostable 
                packaging to water-efficient farming, every step of our process aims to protect 
                the environment while delivering the best produce.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Droplets className="w-8 h-8 text-accent mx-auto mb-2" />
                    <h4 className="font-semibold">Water Efficient</h4>
                    <p className="text-sm text-muted-foreground">90% less water usage</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Recycle className="w-8 h-8 text-accent mx-auto mb-2" />
                    <h4 className="font-semibold">Compostable</h4>
                    <p className="text-sm text-muted-foreground">Eco-friendly packaging</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Why It Matters */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-8">Why It Matters to You</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <Leaf className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Pesticide-Free</h3>
                <p className="text-muted-foreground">
                  Our hydroponic system eliminates the need for harmful pesticides, 
                  ensuring cleaner, safer produce for your family.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <Droplets className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Maximum Freshness</h3>
                <p className="text-muted-foreground">
                  Harvested at peak ripeness and delivered within days, 
                  our produce retains maximum nutrients and flavor.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <Recycle className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Eco-Friendly</h3>
                <p className="text-muted-foreground">
                  Supporting sustainable agriculture that protects our planet 
                  for future generations.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-accent/10 p-8 rounded-lg text-center">
            <blockquote className="text-xl italic mb-4">
              "I love knowing my veggies are grown with sustainability in mind! 
              The freshness and quality are unmatched."
            </blockquote>
            <cite className="text-muted-foreground">— Sarah M., Happy Customer</cite>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowWeGrow;