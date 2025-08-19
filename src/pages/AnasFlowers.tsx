import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Flower, 
  Heart, 
  Baby, 
  Cake, 
  Leaf, 
  Star,
  Quote,
  Upload,
  Calendar,
  Palette
} from "lucide-react";
import weddingBouquet from "@/assets/weddingBouquet.png";
import babyShowerFlowers from "@/assets/Large on table.jpg";
import birthdayFlowers from "@/assets/Happy Birthday Centerpeice.jpeg";
import seasonalBouquet from "@/assets/Christmas1.jpg";
import anaPortrait from "@/assets/anaPortrait.png";


import meganCenterpiece from "@/assets/meganCenterpiece.png";

const AnasFlowers = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    eventType: "",
    eventDate: "",
    colorPalette: "",
    preferences: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const scrollToForm = () => {
    const formElement = document.getElementById('bouquet-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
      // Focus the first input for accessibility
      setTimeout(() => {
        const firstInput = formElement.querySelector('input');
        if (firstInput) {
          firstInput.focus();
        }
      }, 500);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.eventType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        event_type: formData.eventType,
        event_date: formData.eventDate || null,
        color_palette: formData.colorPalette || null,
        preferences: formData.preferences || null,
        reference_photos: null // TODO: Implement file upload
      };

      const { error } = await supabase
        .from('bouquet_requests')
        .insert([requestData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your bouquet request has been submitted! We'll respond within 24 hours with a custom proposal."
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        eventType: "",
        eventDate: "",
        colorPalette: "",
        preferences: ""
      });
    } catch (error) {
      console.error('Error submitting bouquet request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const eventTypes = [
    { value: "wedding", label: "Wedding", icon: <Heart className="w-4 h-4" /> },
    { value: "baby-shower", label: "Baby Shower", icon: <Baby className="w-4 h-4" /> },
    { value: "birthday", label: "Birthday", icon: <Cake className="w-4 h-4" /> },
    { value: "anniversary", label: "Anniversary", icon: <Heart className="w-4 h-4" /> },
    { value: "seasonal", label: "Seasonal Event", icon: <Leaf className="w-4 h-4" /> },
    { value: "other", label: "Other", icon: <Flower className="w-4 h-4" /> }
  ];

  const portfolioSections = [
    {
      title: "Weddings",
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      description: "Romantic arrangements for your special day",
      features: ["Bridal bouquets", "Ceremony arrangements", "Reception centerpieces", "Boutonnieres"],
      image: weddingBouquet
    },
    {
      title: "Baby Showers", 
      icon: <Baby className="w-6 h-6 text-blue-500" />,
      description: "Soft, delicate arrangements to celebrate new life",
      features: ["Pastel color palettes", "Gentle flower choices", "Table arrangements", "Welcome displays"],
      image: babyShowerFlowers
    },
    {
      title: "Birthday Arrangements",
      icon: <Cake className="w-6 h-6 text-yellow-500" />,
      description: "Vibrant, joyful arrangements for celebrating another year",
      features: ["Bright color schemes", "Seasonal flowers", "Custom arrangements", "Party centerpieces"],
      image: birthdayFlowers
    },
    {
      title: "Seasonal Bouquets",
      icon: <Leaf className="w-6 h-6 text-green-500" />,
      description: "Fresh arrangements that capture the beauty of each season",
      features: ["Spring tulips", "Summer sunflowers", "Fall chrysanthemums", "Winter evergreens"],
      image: seasonalBouquet
    }
  ];

  const testimonials = [
    {
      text: "Ana created the most beautiful wedding bouquet I could have imagined. Every detail was perfect, and the flowers stayed fresh throughout our entire celebration.",
      author: "Sarah M.",
      event: "Wedding",
      rating: 5
    },
    {
      text: "The baby shower arrangements were absolutely stunning. Ana captured exactly the soft, welcoming feeling we wanted for our special day.",
      author: "Jennifer L.",
      event: "Baby Shower", 
      rating: 5
    },
    {
      text: "Ana's seasonal arrangements bring such joy to our home. Her understanding of color and texture is remarkable.",
      author: "Michael R.",
      event: "Seasonal Arrangements",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative py-32 bg-cover bg-center"
        style={{ backgroundImage: `url(${meganCenterpiece})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Ana's Arrangements</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90 animate-fade-in">
          Combining her love of local flora and creative expression, Ana Dugger forages and designs custom floral arrangements — including grand installations and bespoke bouquets —  for any and every occasion.
          </p>
          <Button variant="organic" size="xl" className="animate-scale-in hover-scale" onClick={scrollToForm}>
            <Flower className="w-5 h-5 mr-2" />
            Request An Arrangement
          </Button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Bouquets by Occasion</h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Cultivated and designed to fit your special day and aesthetic preferences
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioSections.map((section, index) => (
              <Card key={index} className="text-center overflow-hidden hover:scale-105 transition-all duration-300">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={section.image} 
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {section.icon}
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Locals love Ana&apos;s flowers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-accent mb-4" />
                  <p className="text-muted-foreground italic mb-4">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <Badge variant="secondary" className="mt-1">
                      {testimonial.event}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Bouquet Request Form */}
          <div id="bouquet-form">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flower className="w-5 h-5 text-accent" />
                  <span>Request Custom Bouquet</span>
                </CardTitle>
                <CardDescription>
                  Tell us about your vision and we'll create something beautiful together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Contact Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select value={formData.eventType} onValueChange={(value) => handleInputChange("eventType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-date">Event Date</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange("eventDate", e.target.value)}
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="color-palette">Color Palette Preferences</Label>
                    <Input
                      id="color-palette"
                      placeholder="e.g., soft pastels, vibrant autumn colors, classic white and green"
                      value={formData.colorPalette}
                      onChange={(e) => handleInputChange("colorPalette", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferences">Flower Preferences & Special Requests</Label>
                    <Textarea
                      id="preferences"
                      placeholder="Tell us about your vision, preferred flowers, style, budget, or any special requests..."
                      rows={4}
                      value={formData.preferences}
                      onChange={(e) => handleInputChange("preferences", e.target.value)}
                    />
                  </div>
                </div>

                {/* Upload Section */}
                <div className="space-y-2">
                  <Label>Reference Photos (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload inspiration photos to help us understand your vision
                    </p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                </div>

                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    <Flower className="w-4 h-4 mr-2" />
                    {submitting ? "Submitting..." : "Submit Bouquet Request"}
                  </Button>

                  
                </form>
              </CardContent>
            </Card>
          </div>

          {/* About Ana & Process */}
          <div className="space-y-6">
            {/* About Ana */}
            <Card>
              <CardHeader>
                <CardTitle>More about Ana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full">
                    <img 
                      src={anaPortrait} 
                      alt="Ana - Professional Florist"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                  Ana combines classical training with a modern twist to deliver arrangements that are timeless, fresh, and distinctively unique. Her passion for using locally grown, seasonal flowers ensures every bouquet is not only beautiful but also sustainably acquired.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Specialties</p>
                      <p className="text-muted-foreground">Wedding florals, seasonal arrangements</p>
                    </div>
                    <div>
                      <p className="font-semibold">Experience</p>
                      <p className="text-muted-foreground">8+ years in floral design</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process */}
            <Card>
              <CardHeader>
                <CardTitle>Our Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-semibold">Consultation</h4>
                      <p className="text-sm text-muted-foreground">We'll discuss your vision, preferences, and event details</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-semibold">Custom Proposal</h4>
                      <p className="text-sm text-muted-foreground">Receive a detailed proposal with design concepts and pricing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-semibold">Creation</h4>
                      <p className="text-sm text-muted-foreground">Ana carefully crafts your arrangement using the freshest flowers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                    <div>
                      <h4 className="font-semibold">Delivery</h4>
                      <p className="text-sm text-muted-foreground">Perfect timing delivery for your special moment</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-4">Have Questions?</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Phone:</strong> (555) 123-BLOOM</p>
                  <p><strong>Email:</strong> ana@anasflowers.com</p>
                  <p><strong>Studio Hours:</strong> Tue-Sat, 9AM-5PM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnasFlowers;