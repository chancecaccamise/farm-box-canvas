import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowLeft, Clock, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Partner {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  bio: string;
  image_url: string;
  header_image_url: string;
  location: string;
  rating: number;
  partnership_duration: string;
  specialties: string[];
  story: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const PartnerProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPartnerData = async () => {
      try {
        // Fetch partner details
        const { data: partnerData, error: partnerError } = await supabase
          .from('partners')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (partnerError) {
          console.error('Error fetching partner:', partnerError);
          navigate('/support-local');
          return;
        }

        setPartner(partnerData);

        // Fetch partner products
        const { data: productsData, error: productsError } = await supabase
          .from('partner_products')
          .select(`
            products (
              id,
              name,
              description,
              price,
              image,
              category
            )
          `)
          .eq('partner_id', partnerData.id);

        if (productsError) {
          console.error('Error fetching products:', productsError);
        } else {
          const formattedProducts = productsData
            ?.map(item => item.products)
            .filter(Boolean) as Product[];
          setProducts(formattedProducts || []);
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/support-local');
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerData();
  }, [slug, navigate]);

  const addToCart = async (product: Product) => {
    setAddingToCart(product.id);
    try {
      // Simulate adding to cart - replace with actual cart logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  const getCategoryDisplayName = (category: string): string => {
    switch (category) {
      case 'restaurants':
        return 'Restaurant';
      case 'bakery':
        return 'Bakery';
      case 'fisherman':
        return 'Fishing Partner';
      default:
        return 'Partner';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-80 bg-muted"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Partner Not Found</h2>
          <Button onClick={() => navigate('/support-local')}>
            Back to Support Local
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={partner.header_image_url || partner.image_url || '/placeholder.svg'}
          alt={partner.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <Button
              variant="outline"
              onClick={() => navigate(`/partners/${partner.category}`)}
              className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {getCategoryDisplayName(partner.category)}s
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {partner.name}
            </h1>
            <div className="flex items-center space-x-4 text-white/90">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                {getCategoryDisplayName(partner.category)}
              </Badge>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{partner.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{partner.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Partner for {partner.partnership_duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">About {partner.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-muted-foreground">
                  {partner.bio}
                </p>
                {partner.story && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Our Story</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {partner.story}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products Section */}
            {products.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center space-x-2">
                    <ShoppingBag className="w-6 h-6" />
                    <span>Products from {partner.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((product) => (
                      <Card key={product.id} className="border-muted">
                        <div className="aspect-square relative overflow-hidden rounded-t-lg">
                          <img
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <h4 className="font-semibold text-lg">{product.name}</h4>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              ${product.price.toFixed(2)}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => addToCart(product)}
                              disabled={addingToCart === product.id}
                            >
                              {addingToCart === product.id ? "Adding..." : "Add to Cart"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Partner Info Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <img
                    src={partner.image_url || '/placeholder.svg'}
                    alt={partner.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">{partner.location}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Partnership Duration</h3>
                    <p className="text-muted-foreground">{partner.partnership_duration}</p>
                  </div>

                  {partner.specialties && partner.specialties.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {partner.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerProfile;