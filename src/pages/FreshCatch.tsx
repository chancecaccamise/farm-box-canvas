import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/components/AuthProvider';
import { Fish, Phone, User, Mail } from "lucide-react";

interface FreshCatchAnnouncement {
  id: string;
  fish_name: string;
  description: string | null;
  image_url: string | null;
  fisherman_name: string | null;
  created_at: string;
}

const FreshCatch = () => {
  const [announcements, setAnnouncements] = useState<FreshCatchAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertsSubmitting, setAlertsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Admin form state
  const [fishName, setFishName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fishermanName, setFishermanName] = useState("");

  // Enhanced alerts form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [preferredFish, setPreferredFish] = useState("");
  const [deliveryPreferences, setDeliveryPreferences] = useState("");
  const [communicationPrefs, setCommunicationPrefs] = useState<string[]>(['SMS']);
  const [specialRequests, setSpecialRequests] = useState("");

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("fresh_catch_announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to load fresh catch announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fishName.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("fresh_catch_announcements")
        .insert({
          fish_name: fishName,
          description: description || null,
          image_url: imageUrl || null,
          fisherman_name: fishermanName || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fresh catch announcement posted!",
      });

      setFishName("");
      setDescription("");
      setImageUrl("");
      setFishermanName("");
      fetchAnnouncements();
    } catch (error) {
      console.error("Error posting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to post announcement",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSMSSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phoneNumber.trim()) return;

    setAlertsSubmitting(true);
    try {
      const alertData = {
        name: name.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        zip_code: zipCode.trim() || null,
        preferred_fish_types: preferredFish.trim() 
          ? preferredFish.split(',').map(fish => fish.trim()).filter(fish => fish.length > 0)
          : null,
        delivery_preferences: deliveryPreferences.trim() || null,
        communication_preferences: communicationPrefs.length > 0 ? communicationPrefs : null,
        special_requests: specialRequests.trim() || null
      };

      const { error } = await supabase
        .from("fresh_fish_alerts_enhanced")
        .insert(alertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You've been signed up for fresh fish alerts! We'll contact you when your preferred fish are available.",
      });

      // Reset form
      setName("");
      setEmail("");
      setPhoneNumber("");
      setZipCode("");
      setPreferredFish("");
      setDeliveryPreferences("");
      setCommunicationPrefs(['SMS']);
      setSpecialRequests("");
    } catch (error) {
      console.error("Error signing up for alerts:", error);
      toast({
        title: "Error",
        description: "Failed to sign up for alerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAlertsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Fresh Catch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated on the freshest fish coming in from our local fishermen partners
          </p>
        </div>


        {/* Announcements Feed */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Recent Catches</h2>
          
          {loading ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Fish className="h-8 w-8 text-white" />
              </div>
              <p className="text-muted-foreground">Loading fresh catches...</p>
            </div>
          ) : announcements.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="text-center py-8">
                <Fish className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No fresh catches yet</h3>
                <p className="text-muted-foreground">Check back soon for the latest catches!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="overflow-hidden">
                  {announcement.image_url && (
                    <div className="aspect-video bg-muted">
                      <img
                        src={announcement.image_url}
                        alt={announcement.fish_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Fish className="h-5 w-5 text-primary" />
                      {announcement.fish_name}
                    </CardTitle>
                    <CardDescription>
                      {formatDate(announcement.created_at)}
                    </CardDescription>
                  </CardHeader>
                  {announcement.description && (
                    <CardContent>
                      <p className="text-muted-foreground">{announcement.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Fresh Fish Alerts Signup */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Fish className="h-6 w-6 text-primary" />
              Get Fresh Fish Alerts
            </CardTitle>
            <CardDescription>
              Sign up to receive notifications when your preferred fresh fish arrive from our local fishermen partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSMSSignup} className="space-y-6">
              {/* Required Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium">
                    Zip Code
                  </Label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="12345"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Optional Preferences */}
              <div className="space-y-2">
                <Label htmlFor="preferredFish" className="text-sm font-medium">
                  Preferred Fish Types
                </Label>
                <Input
                  id="preferredFish"
                  type="text"
                  value={preferredFish}
                  onChange={(e) => setPreferredFish(e.target.value)}
                  placeholder="e.g. Salmon, Tuna, Snapper (separate with commas)"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to receive alerts for all fish types
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryPrefs" className="text-sm font-medium">
                  Delivery Preferences
                </Label>
                <Input
                  id="deliveryPrefs"
                  type="text"
                  value={deliveryPreferences}
                  onChange={(e) => setDeliveryPreferences(e.target.value)}
                  placeholder="e.g. Same day pickup, Next day delivery"
                  className="w-full"
                />
              </div>

              {/* Communication Preferences */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  How would you like to be notified? *
                </Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms"
                      checked={communicationPrefs.includes('SMS')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCommunicationPrefs(prev => [...prev.filter(p => p !== 'SMS'), 'SMS']);
                        } else {
                          setCommunicationPrefs(prev => prev.filter(p => p !== 'SMS'));
                        }
                      }}
                    />
                    <Label htmlFor="sms" className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      Text Messages (SMS)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-alerts"
                      checked={communicationPrefs.includes('Email')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCommunicationPrefs(prev => [...prev.filter(p => p !== 'Email'), 'Email']);
                        } else {
                          setCommunicationPrefs(prev => prev.filter(p => p !== 'Email'));
                        }
                      }}
                    />
                    <Label htmlFor="email-alerts" className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </Label>
                  </div>
                </div>
                {communicationPrefs.length === 0 && (
                  <p className="text-xs text-red-500">
                    Please select at least one notification method
                  </p>
                )}
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label htmlFor="specialRequests" className="text-sm font-medium">
                  Special Requests or Notes
                </Label>
                <Textarea
                  id="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests, dietary restrictions, or additional notes..."
                  className="w-full min-h-[80px]"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={alertsSubmitting || !name.trim() || !email.trim() || !phoneNumber.trim() || communicationPrefs.length === 0}
                className="w-full"
              >
                {alertsSubmitting ? "Signing Up..." : "Sign Up for Fresh Fish Alerts"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                * Required fields. We'll only contact you about fresh fish availability and never share your information.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreshCatch;