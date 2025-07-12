import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Fish, 
  Wheat, 
  ChefHat,
  MapPin, 
  Star, 
  Users,
  Heart,
  Award
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

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
  story: string;
}

const SupportLocal = () => {
  const navigate = useNavigate();
  const [partnerPreviews, setPartnerPreviews] = useState<{
    restaurants: Partner[];
    bakery: Partner[];
    fisherman: Partner[];
  }>({ restaurants: [], bakery: [], fisherman: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartnerPreviews = async () => {
      try {
        // Fetch 2 partners from each category for preview
        const categories = ['restaurants', 'bakery', 'fisherman'] as const;
        const previews: any = {};

        for (const category of categories) {
          const { data, error } = await supabase
            .from('partners')
            .select('*')
            .eq('category', category)
            .eq('is_active', true)
            .order('name')
            .limit(2);

          if (error) {
            console.error(`Error fetching ${category} partners:`, error);
            previews[category] = [];
          } else {
            previews[category] = data || [];
          }
        }

        setPartnerPreviews(previews);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerPreviews();
  }, []);

  const categoryConfig = {
    restaurants: {
      title: 'Restaurants',
      icon: ChefHat,
      description: 'Farm-to-table dining partners',
      route: '/partners/restaurants',
      color: 'bg-green-100 text-green-800'
    },
    bakery: {
      title: 'Bakery Partners',
      icon: Wheat,
      description: 'Artisan bakers using local ingredients',
      route: '/partners/bakery',
      color: 'bg-amber-100 text-amber-800'
    },
    fisherman: {
      title: 'Fishing Partners',
      icon: Fish,
      description: 'Sustainable seafood providers',
      route: '/partners/fisherman',
      color: 'bg-blue-100 text-blue-800'
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
          {Object.entries(categoryConfig).map(([categoryKey, config]) => {
            const IconComponent = config.icon;
            const partners = partnerPreviews[categoryKey as keyof typeof partnerPreviews];
            
            return (
              <div key={categoryKey}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-secondary rounded-lg">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{config.title}</h2>
                      <p className="text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(config.route)}
                    className="shrink-0"
                  >
                    See all {config.title}
                  </Button>
                </div>

                {loading ? (
                  <div className="grid lg:grid-cols-2 gap-8">
                    {[...Array(2)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-6 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded mb-4"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-32 bg-muted rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : partners.length > 0 ? (
                  <div className="grid lg:grid-cols-2 gap-8">
                    {partners.map((partner) => (
                      <Card 
                        key={partner.id} 
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        onClick={() => navigate(`/partners/${partner.slug}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{partner.name}</CardTitle>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                                <MapPin className="w-4 h-4" />
                                <span>{partner.location}</span>
                              </div>
                              <Badge variant="secondary" className={config.color}>
                                {config.title.replace(' Partners', '').slice(0, -1)}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 mb-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{partner.rating}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {partner.partnership_duration} with us
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <CardDescription className="text-base leading-relaxed">
                            {partner.description}
                          </CardDescription>

                          {partner.specialties && partner.specialties.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                                <Award className="w-4 h-4 text-accent" />
                                <span>Specialties</span>
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {partner.specialties.slice(0, 4).map((specialty, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                                {partner.specialties.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{partner.specialties.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {partner.story && (
                            <div className="bg-secondary/50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                                <Users className="w-4 h-4 text-accent" />
                                <span>Their Story</span>
                              </h4>
                              <p className="text-sm text-muted-foreground italic line-clamp-3">
                                "{partner.story}"
                              </p>
                            </div>
                          )}

                          <Button variant="outline" className="w-full">
                            View {partner.name} Profile
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No {config.title.toLowerCase()} available at the moment.</p>
                    <p className="text-sm mt-2">We're always looking for new partners in this category.</p>
                  </div>
                )}
              </div>
            );
          })}
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