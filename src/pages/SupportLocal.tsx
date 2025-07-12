import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Fish, 
  Wheat, 
  Hexagon, 
  MapPin, 
  Star, 
  Users,
  Heart,
  Award
} from "lucide-react";

const SupportLocal = () => {
  const partners = [
    {
      category: "Fishermen",
      icon: <Fish className="w-8 h-8 text-blue-600" />,
      businesses: [
        {
          name: "Captain Mike's Day Boat",
          location: "Coastal Harbor, 15 miles",
          description: "Sustainable day-boat fishing providing the freshest catch from local waters. Mike has been fishing these waters for over 20 years.",
          specialties: ["Wild-caught salmon", "Day boat scallops", "Local crab", "Seasonal fish"],
          story: "Captain Mike uses traditional fishing methods that respect marine ecosystems and ensure the highest quality seafood.",
          rating: 4.9,
          yearsPartnership: 3
        },
        {
          name: "Ocean's Best Seafood Co.",
          location: "Marina District, 8 miles", 
          description: "Family-owned seafood operation focused on sustainable fishing practices and supporting local fishing communities.",
          specialties: ["Oysters", "Mussels", "Lobster", "Seasonal shellfish"],
          story: "Three generations of the Morrison family have been bringing fresh seafood to our community with a commitment to ocean conservation.",
          rating: 4.8,
          yearsPartnership: 5
        }
      ]
    },
    {
      category: "Bakers",
      icon: <Wheat className="w-8 h-8 text-amber-600" />,
      businesses: [
        {
          name: "Village Artisan Bakery",
          location: "Downtown Square, 12 miles",
          description: "Traditional European-style bakery using locally-milled flour and time-honored techniques for exceptional breads and pastries.",
          specialties: ["Sourdough bread", "Croissants", "Seasonal pastries", "Whole grain loaves"],
          story: "Master baker Elena trained in France and brings authentic techniques to create bread that's both nutritious and delicious.",
          rating: 4.9,
          yearsPartnership: 4
        },
        {
          name: "Sunrise Grain & Bread",
          location: "Mill Valley, 18 miles",
          description: "Mill and bakery combination that grows, mills, and bakes all in one location for the freshest possible bread and grain products.",
          specialties: ["Fresh-milled flour", "Rustic breads", "Ancient grain products", "Custom orders"],
          story: "From seed to loaf, they control every step of the process to ensure the highest quality and freshest taste.",
          rating: 4.7,
          yearsPartnership: 2
        }
      ]
    },
    {
      category: "Honey & Jam Makers", 
      icon: <Hexagon className="w-8 h-8 text-yellow-600" />,
      businesses: [
        {
          name: "Mountain Bee Company",
          location: "Highland Ridge, 25 miles",
          description: "High-altitude beekeeping operation producing pure, raw honey and bee products from wildflower meadows.",
          specialties: ["Wildflower honey", "Seasonal varieties", "Bee pollen", "Raw honeycomb"],
          story: "Our bees forage in pristine mountain meadows, creating honey with unique floral notes that change with the seasons.",
          rating: 5.0,
          yearsPartnership: 6
        },
        {
          name: "Grandma Rose's Preserves",
          location: "Orchard Valley, 22 miles",
          description: "Small-batch jam and preserve maker using fruit from their own orchards and traditional family recipes passed down for generations.",
          specialties: ["Seasonal fruit jams", "Pickled vegetables", "Fruit preserves", "Holiday specialties"],
          story: "Rose's granddaughter carries on the tradition of making preserves with love, using only the finest local fruit and time-tested recipes.",
          rating: 4.8,
          yearsPartnership: 4
        }
      ]
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Fishermen": return "bg-blue-100 text-blue-800";
      case "Bakers": return "bg-amber-100 text-amber-800";
      case "Honey & Jam Makers": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Support Local Partners</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Meet the incredible local businesses we're proud to partner with. Every purchase 
            supports these hardworking families and strengthens our community.
          </p>
        </div>

        {/* Impact Stats */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-accent mb-2">45+</div>
                <div className="text-sm text-muted-foreground">Local businesses supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">$2.3M</div>
                <div className="text-sm text-muted-foreground">Paid to local partners annually</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">150+</div>
                <div className="text-sm text-muted-foreground">Local jobs supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">50mi</div>
                <div className="text-sm text-muted-foreground">Average distance from our facility</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Categories */}
        <div className="space-y-12">
          {partners.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-secondary rounded-lg">
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{category.category}</h2>
                  <p className="text-muted-foreground">
                    {category.businesses.length} trusted local partners
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {category.businesses.map((business, businessIndex) => (
                  <Card key={businessIndex} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{business.name}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{business.location}</span>
                          </div>
                          <Badge variant="secondary" className={getCategoryColor(category.category)}>
                            {category.category.slice(0, -1)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{business.rating}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {business.yearsPartnership} years with us
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-base leading-relaxed">
                        {business.description}
                      </CardDescription>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <Award className="w-4 h-4 text-accent" />
                          <span>Specialties</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {business.specialties.map((specialty, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <Users className="w-4 h-4 text-accent" />
                          <span>Their Story</span>
                        </h4>
                        <p className="text-sm text-muted-foreground italic">
                          "{business.story}"
                        </p>
                      </div>

                      <Button variant="outline" className="w-full">
                        View Products from {business.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="mt-16">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Want to Become a Partner?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're always looking for passionate local producers who share our commitment 
              to quality, sustainability, and community. If you're a local farmer, baker, 
              fisherman, or artisan food producer, we'd love to hear from you.
            </p>
            <Button size="lg">
              <Heart className="w-4 h-4 mr-2" />
              Apply to Partner with Us
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportLocal;