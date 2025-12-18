import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Flower, 
  Heart, 
  Briefcase, 
  Cake, 
  Leaf, 
  Star,
  Quote,
  Upload,
  Calendar,
  Palette,
  Camera,
  ChevronDown
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
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const scrollToForm = () => {
    const formElement = document.getElementById('consultation-form');
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

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < Math.min(files.length, 5); i++) { // Limit to 5 files
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file`,
            variant: "destructive"
          });
          continue;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 5MB limit`,
            variant: "destructive"
          });
          continue;
        }
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `bouquet-references/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);
        
        if (error) throw error;
        
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrlData.publicUrl);
      }
      
      setUploadedPhotos(prev => [...prev, ...uploadedUrls]);
      
      if (uploadedUrls.length > 0) {
        toast({
          title: "Photos uploaded",
          description: `Successfully uploaded ${uploadedUrls.length} photo(s)`
        });
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoUrl: string) => {
    setUploadedPhotos(prev => prev.filter(url => url !== photoUrl));
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
        reference_photos: uploadedPhotos.length > 0 ? uploadedPhotos : null
      };

      const { error } = await supabase
        .from('bouquet_requests')
        .insert([requestData]);

      if (error) throw error;

      toast({
        title: "Success", 
        description: "Your consultation request has been submitted! We'll contact you within 24 hours to schedule your event consultation."
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
      setUploadedPhotos([]);
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
    { value: "commercial", label: "Commercial Client", icon: <Briefcase className="w-4 h-4" /> },
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
      title: "Commercial Clients", 
      icon: <Briefcase className="w-6 h-6 text-blue-500" />,
      description: "Professional floral arrangements for businesses and venues",
      features: ["Office arrangements", "Restaurant displays", "Spa & salon flowers", "Weekly subscriptions"],
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
      text: "I have had such wonderful experiences working with Ana at Billy’s Botanicals! She is amazing to work with—her communication is always clear and timely, and she truly listens to what couples want for their wedding day. Ana is incredibly talented and creates the most beautiful floral arrangements that can completely transform our venues or add just enough to enhance their natural beauty. She has a gift for bringing creative visions to life while also offering her expertise and artistic touch to make everything even more stunning than imagined. If you’re looking for someone professional, thoughtful, and passionate about her craft, Ana is the perfect choice for your wedding flowers!",
      author: "Melanie Marchand - Senior Wedding & Event Specialist, Red Gate Farms",
      event: "Wedding",
      rating: 5
    },
    {
      text: "As a recent bride who loves flowers, I highly recommend Ana’s services. Floral selection was something I dreamed about for my wedding day. I was able to put my trust in her.Ana completely followed through with the vision I provided for my bouquet. I gave her more freedom with the altar centerpiece. It was stunning and a beautiful compliment to my bouquet. Everything looked cohesive yet unique to where it was placed. Everything held up throughout the day and night.Ana not only provided stunning floral arrangements, but also demonstrated professionalism and kindness. I’m so glad I could count on her. It brought peace of mind for our big day.",
      author: "Erin B.",
      event: "Wedding", 
      rating: 5
    },
    {
      text: "We would like to extend our heartfelt thanks to Ana and her team for their wonderful service. I shared my ideas with Ana for our wedding day, and she executed the vision beautifully. All of the florals were fresh, vibrant in color, and thoughtfully arranged to complement our theme. Ana maintained excellent communication with us throughout the planning process, and she even coordinated with our vendors to ensure everything matched perfectly. Her professionalism and attention to detail were truly appreciated. The prices were reasonable, and the service exceeded our expectations.Thank you, Ana, for helping make our special day so beautiful and memorable!",
      author: "Adeina",
      event: "Wedding",
      rating: 5
    },
    {
      text: "Words can't express how grateful we are to have had our dear friend Ana do the flowers for our wedding. We've always known how talented she is, but watching her bring our vision to life was truly magical.From our very first conversation, Ana took my rambling ideas and chaos and turned it into something truly cohesive and elegant. She understood the vibe we wanted to create and offered brilliant suggestions that perfectly complemented our venue and color palette. The results were beyond anything we could have dreamed of. My bouquet was a true work of art which brought tears to my eyes as soon as I saw it. The florals at our ceremony were absolutely breathtaking, and the centerpieces at the reception perfectly tied the entire room together. We received soooo many compliments, even many months later. Beyond the incredible artistry, Ana was a complete professional throughout the entire process. She handled everything flawlessly on the wedding day, and her calming presence made us feel so at ease and taken care of. If you are looking for a florist who will not only deliver your dream florals but also genuinely care about your special day, look no further than Flowers by Ana. We feel so lucky to call Ana a friend and even luckier that we got to be one of her clients. We cannot recommend her and her team highly enough!",
      author: "Libby B.",
      event: "Wedding",
      rating: 5
    },
    {
      text: "Flowers by AND does a weekly flower arrangement for us at Lavender Hill SpaSalon and the flowers catch every customer's eye. They are beautiful every single week. Each arrangement is unique, interesting and one-of-a-kind; we get so many compliments!",
      author: "Karen G. at SalonSpa",
      event: "Other",
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
            <Calendar className="w-5 h-5 mr-2" />
            Schedule A Consultation
          </Button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Events We Specialize In</h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Professional floral design consultation for every special occasion and milestone event
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

        {/* Gallery Preview */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Featured Arrangements</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover Ana's artistry through our collection of custom floral designs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="group relative overflow-hidden rounded-lg aspect-square">
              <img 
                src={weddingBouquet} 
                alt="Wedding Bouquet - Elegant white and green arrangement"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold">Wedding Collection</h3>
                <p className="text-sm opacity-90">Romantic & timeless</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg aspect-square">
              <img 
                src={birthdayFlowers} 
                alt="Birthday Centerpiece - Vibrant celebration arrangement"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold">Celebration Centerpieces</h3>
                <p className="text-sm opacity-90">Joyful & colorful</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg aspect-square">
              <img 
                src={seasonalBouquet} 
                alt="Seasonal Bouquet - Fresh seasonal flower arrangement"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold">Seasonal Selections</h3>
                <p className="text-sm opacity-90">Nature's finest</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button variant="outline" size="lg" className="group" asChild>
              <a href="/gallery">
                <Camera className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                View Full Gallery
              </a>
            </Button>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Locals love Ana&apos;s Arrangements</h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => {
                const MAX_CHARS = 200;
                const needsTruncation = testimonial.text.length > MAX_CHARS;
                const truncatedText = needsTruncation 
                  ? testimonial.text.substring(0, MAX_CHARS).trim() + "..."
                  : testimonial.text;

                return (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full min-h-[400px]">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-center space-x-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <Quote className="w-8 h-8 text-accent mb-4" />
                        
                        {needsTruncation ? (
                          <Accordion type="single" collapsible className="flex-grow mb-4">
                            <AccordionItem value={`testimonial-${index}`} className="border-none">
                              <p className="text-muted-foreground italic text-sm mb-2">
                                "{truncatedText}"
                              </p>
                              
                              <AccordionTrigger className="flex items-center justify-start text-accent hover:text-accent/80 py-1 px-0 hover:no-underline">
                                <span className="text-xs underline">Read more</span>
                                <ChevronDown className="h-3 w-3 ml-1 shrink-0 transition-transform duration-200" />
                              </AccordionTrigger>
                              
                              <AccordionContent className="text-muted-foreground italic text-sm pt-2">
                                "{testimonial.text}"
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ) : (
                          <p className="text-muted-foreground italic mb-4 flex-grow text-sm">
                            "{testimonial.text}"
                          </p>
                        )}
                        
                        <div className="mt-auto">
                          <p className="font-semibold">{testimonial.author}</p>
                          <Badge variant="secondary" className="mt-1">
                            {testimonial.event}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-0 -translate-x-12" />
            <CarouselNext className="right-0 translate-x-12" />
          </Carousel>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Event Consultation Form */}
          <div id="consultation-form">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span>Request Event Consultation</span>
                </CardTitle>
                <CardDescription>
                  Schedule a consultation to discuss your event's floral needs and design vision
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
                    <Label htmlFor="preferences">Event Vision & Consultation Notes</Label>
                    <Textarea
                      id="preferences"
                      placeholder="Tell us about your event vision, style preferences, venue details, budget considerations, or specific consultation topics you'd like to discuss..."
                      rows={4}
                      value={formData.preferences}
                      onChange={(e) => handleInputChange("preferences", e.target.value)}
                    />
                  </div>
                </div>

                {/* Upload Section */}
                <div className="space-y-4">
                  <Label>Reference Photos (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload inspiration photos to help us understand your event vision (max 5 photos, 5MB each)
                    </p>
                    <input
                      type="file"
                      id="photo-upload"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button"
                      disabled={uploading}
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      {uploading ? "Uploading..." : "Choose Files"}
                    </Button>
                  </div>
                  
                  {/* Display uploaded photos */}
                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedPhotos.map((photoUrl, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={photoUrl} 
                            alt={`Reference photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(photoUrl)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {submitting ? "Submitting..." : "Submit Consultation Request"}
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
                  <p><strong>Phone:</strong> 804-712-2697</p>
                  <p><strong>Email:</strong> Duggeran@gmail.com</p>
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