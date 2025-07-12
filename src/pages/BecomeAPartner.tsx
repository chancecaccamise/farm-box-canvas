import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Handshake, Leaf } from "lucide-react";

const BecomeAPartner = () => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    businessType: "",
    phoneNumber: "",
    email: "",
    message: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.businessName || !formData.businessType || 
        !formData.phoneNumber || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("partner_applications")
        .insert({
          full_name: formData.fullName,
          business_name: formData.businessName,
          business_type: formData.businessType,
          phone_number: formData.phoneNumber,
          email: formData.email,
          message: formData.message || null,
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });

      // Reset form
      setFormData({
        fullName: "",
        businessName: "",
        businessType: "",
        phoneNumber: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Handshake className="h-10 w-10 text-primary" />
            Partner with Billy's Botanicals
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our community of local vendors and help us bring the freshest, most sustainable products 
            to our customers. We work with farmers, fishermen, bakers, restaurants, and more to support 
            our local food ecosystem.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Leaf className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>Sustainable Partnership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                We prioritize environmentally conscious practices and support local communities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <Handshake className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>Fair Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                We believe in fair compensation and long-term relationships with our partners
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-white">🌱</span>
              </div>
              <CardTitle>Community Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Together, we're building a stronger, more resilient local food network
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Partnership Application</CardTitle>
            <CardDescription>
              Tell us about your business and how we can work together
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder="Your business name"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessType">Type of Business *</Label>
                <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="fisherman">Fisherman</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="(555) 123-4567"
                    type="tel"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Tell Us About Your Business</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="What products or services do you offer? What makes your business unique? How would you like to partner with us?"
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting Application..." : "Apply to Join"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Have questions? Email us at{" "}
            <a href="mailto:partners@billysbotanicals.com" className="text-primary hover:underline">
              partners@billysbotanicals.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BecomeAPartner;