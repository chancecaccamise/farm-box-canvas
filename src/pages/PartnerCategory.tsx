import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  bio: string;
  image_url: string;
  location: string;
  rating: number;
  partnership_duration: string;
  specialties: string[];
}

interface PartnerCategoryProps {
  category: 'restaurants' | 'bakery' | 'fisherman';
}

const getCategoryTitle = (category: string): string => {
  switch (category) {
    case 'restaurants':
      return 'Our Partner Restaurants';
    case 'bakery':
      return 'Our Bakery Partners';
    case 'fisherman':
      return 'Our Fishing and Farm Partners';
    default:
      return 'Our Partners';
  }
};

const getCategoryDescription = (category: string): string => {
  switch (category) {
    case 'restaurants':
      return 'Discover the restaurants that bring our fresh ingredients to life with creative, seasonal menus.';
    case 'bakery':
      return 'Meet the artisan bakers who craft delicious breads and pastries using the finest local ingredients.';
    case 'fisherman':
      return 'Learn about the fishing families who provide us with the freshest, sustainably caught seafood.';
    default:
      return 'Explore our network of local partners committed to quality and sustainability.';
  }
};

const PartnerCategory = ({ category }: PartnerCategoryProps) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('category', category)
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching partners:', error);
          return;
        }

        setPartners(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {getCategoryTitle(category)}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {getCategoryDescription(category)}
          </p>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="container mx-auto px-4 py-12">
        {partners.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              No partners found
            </h3>
            <p className="text-muted-foreground">
              We're always looking for new partners in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner) => (
              <Card key={partner.id} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={partner.image_url || '/placeholder.svg'}
                    alt={partner.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {partner.name}
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{partner.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{partner.location}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-3">
                    {partner.description}
                  </p>
                  
                  {partner.specialties && partner.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {partner.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {partner.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{partner.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/partners/${partner.slug}`)}
                  >
                    View {partner.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Support Local */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            onClick={() => navigate('/support-local')}
            className="px-8"
          >
            ← Back to Support Local
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PartnerCategory;