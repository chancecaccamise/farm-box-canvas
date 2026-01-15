import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Briefcase, Cake, Leaf, Flower } from "lucide-react";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  sort_order: number;
}

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { value: "all", label: "All Arrangements", icon: <Flower className="w-4 h-4" /> },
    { value: "wedding", label: "Weddings", icon: <Heart className="w-4 h-4" /> },
    { value: "celebration", label: "Celebrations", icon: <Cake className="w-4 h-4" /> },
    { value: "commercial", label: "Commercial Clients", icon: <Briefcase className="w-4 h-4" /> },
    { value: "seasonal", label: "Seasonal Bouquets", icon: <Leaf className="w-4 h-4" /> }
  ];

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery_images")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setGalleryImages(data || []);
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

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
              <Link to="/anas-flowers">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Ana's Arrangements
              </Link>
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Loading gallery...</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredImages.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.image_url}
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
        )}

        {/* Call to Action */}
        <div className="text-center bg-muted/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Create Something Beautiful?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Let Ana design a custom arrangement that perfectly captures your vision and brings your special occasion to life.
          </p>
          <Button size="lg" asChild>
            <Link to="/anas-flowers#bouquet-form">
              <Flower className="w-4 h-4 mr-2" />
              Request Custom Arrangement
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Gallery;