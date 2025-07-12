import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Droplets, 
  Truck, 
  Recycle, 
  Sun, 
  Wind,
  TreePine,
  Package
} from "lucide-react";

const Sustainability = () => {
  const practices = [
    {
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      title: "Hydroponic Growing",
      description: "Our partner farms use advanced hydroponic systems that use 90% less water than traditional farming while producing higher yields.",
      impact: "Saves 2.5 million gallons of water annually",
      benefits: ["Year-round growing", "No pesticides needed", "Higher nutrient density", "Reduced land use"]
    },
    {
      icon: <Package className="w-8 h-8 text-green-600" />,
      title: "Compostable Packaging",
      description: "All our packaging materials are 100% compostable or recyclable, from our boxes to our cooling packs.",
      impact: "Diverts 50 tons of waste from landfills yearly",
      benefits: ["Biodegradable materials", "Minimal plastic use", "Reusable cooling packs", "Recyclable cardboard"]
    },
    {
      icon: <Truck className="w-8 h-8 text-orange-600" />,
      title: "Low-Mileage Delivery",
      description: "We source from farms within 100 miles and optimize delivery routes to minimize our carbon footprint.",
      impact: "Reduces food miles by 80% vs grocery stores",
      benefits: ["Local sourcing", "Optimized routes", "Electric delivery vehicles", "Consolidated deliveries"]
    },
    {
      icon: <Sun className="w-8 h-8 text-yellow-600" />,
      title: "Renewable Energy",
      description: "Our facilities and many partner farms run on solar and wind power, reducing dependence on fossil fuels.",
      impact: "100% renewable energy at our main facility",
      benefits: ["Solar-powered operations", "Wind energy partnerships", "Carbon neutral shipping", "Clean energy incentives"]
    }
  ];

  const certifications = [
    { name: "USDA Organic", description: "Certified organic farming practices" },
    { name: "B-Corp Certified", description: "Meeting high standards of social and environmental performance" },
    { name: "Carbon Neutral", description: "Net-zero carbon emissions through offsetting programs" },
    { name: "Local First", description: "Committed to supporting local agricultural communities" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Our Sustainability Commitment</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're committed to regenerative farming practices, minimal environmental impact, 
            and building a more sustainable food system for future generations.
          </p>
        </div>

        {/* Key Practices */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Sustainable Practices</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {practices.map((practice, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-secondary rounded-lg">
                      {practice.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{practice.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {practice.impact}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    {practice.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Key Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {practice.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Environmental Impact</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">2.5M</div>
                  <div className="text-sm text-muted-foreground">Gallons of water saved annually</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">50</div>
                  <div className="text-sm text-muted-foreground">Tons of waste diverted from landfills</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">80%</div>
                  <div className="text-sm text-muted-foreground">Reduction in food miles</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">25+</div>
                  <div className="text-sm text-muted-foreground">Local farms supported</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certifications */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Certifications & Standards</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                    <Recycle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Future Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our 2025 Goals</CardTitle>
            <CardDescription className="text-center">
              Continuing our commitment to environmental stewardship
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <TreePine className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Carbon Negative</h4>
                <p className="text-sm text-muted-foreground">
                  Achieve carbon negative operations by sequestering more carbon than we emit
                </p>
              </div>
              
              <div className="text-center">
                <Wind className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">100% Renewable</h4>
                <p className="text-sm text-muted-foreground">
                  Partner only with farms using 100% renewable energy sources
                </p>
              </div>
              
              <div className="text-center">
                <Recycle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Zero Waste</h4>
                <p className="text-sm text-muted-foreground">
                  Eliminate all packaging waste through reusable container programs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sustainability;