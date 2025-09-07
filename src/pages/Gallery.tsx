import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Baby, Cake, Leaf, Flower } from "lucide-react";
import weddingBouquet from "@/assets/weddingBouquet.png";
import babyShowerFlowers from "@/assets/Large on table.jpg";
import birthdayFlowers from "@/assets/Happy Birthday Centerpeice.jpeg";
import seasonalBouquet from "@/assets/Christmas1.jpg";
import meganCenterpiece from "@/assets/meganCenterpiece.png";
import anaFlowersHero from "@/assets/ana-flowers-hero.jpg";

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { value: "all", label: "All Arrangements", icon: <Flower className="w-4 h-4" /> },
    { value: "weddings", label: "Weddings", icon: <Heart className="w-4 h-4" /> },
    { value: "celebrations", label: "Celebrations", icon: <Cake className="w-4 h-4" /> },
    { value: "baby-showers", label: "Baby Showers", icon: <Baby className="w-4 h-4" /> },
    { value: "seasonal", label: "Seasonal", icon: <Leaf className="w-4 h-4" /> }
  ];

  const galleryImages = [
    {
      src: weddingBouquet,
      title: "Classic Wedding Bouquet",
      category: "weddings",
      description: "Elegant white roses and greenery for a timeless ceremony"
    },
    {
      src: birthdayFlowers,
      title: "Birthday Centerpiece",
      category: "celebrations", 
      description: "Vibrant mixed flowers perfect for celebration tables"
    },
    {
      src: seasonalBouquet,
      title: "Holiday Arrangement",
      category: "seasonal",
      description: "Festive seasonal flowers with rich winter colors"
    },
    {
      src: babyShowerFlowers,
      title: "Baby Shower Display",
      category: "baby-showers",
      description: "Soft, delicate arrangements for welcoming new life"
    },
    {
      src: meganCenterpiece,
      title: "Grand Table Centerpiece",
      category: "celebrations",
      description: "Stunning focal point arrangement for special occasions"
    },
    {
      src: anaFlowersHero,
      title: "Seasonal Garden Mix",
      category: "seasonal",
      description: "Fresh seasonal flowers showcasing nature's beauty"
    }
  ];

  const filteredImages = activeFilter === "all" 
    ? galleryImages 
    : galleryImages.filter(image => image.category === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <a href="/anas-flowers">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Ana's Arrangements
              </a>
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Ana's Gallery</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of custom floral arrangements, each piece thoughtfully designed to capture the essence of your special moments
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
              className="flex items-center space-x-2"
            >
              {filter.icon}
              <span>{filter.label}</span>
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredImages.map((image, index) => (
            <Card key={index} className="overflow-hidden group">
              <div className="aspect-square overflow-hidden">
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{image.title}</h3>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {filters.find(f => f.value === image.category)?.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {image.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-muted/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Create Something Beautiful?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Let Ana design a custom arrangement that perfectly captures your vision and brings your special occasion to life.
          </p>
          <Button size="lg" asChild>
            <a href="/anas-flowers#bouquet-form">
              <Flower className="w-4 h-4 mr-2" />
              Request Custom Arrangement
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Gallery;