
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const BoxComparison = () => {
  const boxOptions = [
    {
      size: "small",
      name: "Small Box",
      price: "$24.99",
      items: "8-10 items",
      serves: "Perfect for 1-2 people",
      sampleItems: ["Rainbow Carrots", "Leafy Greens", "Heritage Tomatoes", "Fresh Herbs"],
      popular: false
    },
    {
      size: "medium", 
      name: "Medium Box",
      price: "$34.99",
      items: "12-15 items",
      serves: "Great for 2-4 people",
      sampleItems: ["Rainbow Carrots", "Leafy Greens", "Heritage Tomatoes", "Bell Peppers", "Fresh Fish", "Artisan Bread"],
      popular: true
    },
    {
      size: "large",
      name: "Large Box", 
      price: "$44.99",
      items: "18-22 items",
      serves: "Ideal for 4+ people",
      sampleItems: ["Rainbow Carrots", "Leafy Greens", "Heritage Tomatoes", "Bell Peppers", "Fresh Fish", "Artisan Bread", "Seasonal Herbs", "Local Honey"],
      popular: false
    }
  ];

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Choose Your Weekly Box</h2>
        <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
          Each box is carefully curated with the freshest local produce, sustainable seafood, and artisan goods
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {boxOptions.map((box) => (
            <Card key={box.size} className={`relative text-center ${box.popular ? 'ring-2 ring-accent shadow-lg scale-105' : ''}`}>
              {box.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-white">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl mb-2">{box.name}</CardTitle>
                <div className="text-4xl font-bold text-primary mb-2">{box.price}</div>
                <div className="text-sm text-muted-foreground mb-1">per week</div>
                <CardDescription className="text-base font-medium">{box.serves}</CardDescription>
                <div className="text-sm text-accent font-medium">{box.items}</div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-left">
                  <h4 className="font-semibold mb-3 text-center">What's Inside This Week:</h4>
                  <ul className="space-y-2">
                    {box.sampleItems.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button asChild className="w-full" variant={box.popular ? "default" : "outline"}>
                  <Link to={`/box-selection?size=${box.size}`}>Select This Plan</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            All subscriptions include free delivery • Skip or pause anytime • Cancel without fees
          </p>
        </div>
      </div>
    </section>
  );
};

export default BoxComparison;
