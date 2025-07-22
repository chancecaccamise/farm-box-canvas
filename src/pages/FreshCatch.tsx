import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/components/AuthProvider';
import { Fish, Phone, User } from "lucide-react";

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
              Join our community of fresh fish enthusiasts! Get notified when your favorite fish come in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSMSSignup} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alertName">Full Name *</Label>
                  <Input
                    id="alertName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    type="tel"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="preferredFish">Preferred Fish Types</Label>
                <Input
                  id="preferredFish"
                  value={preferredFish}
                  onChange={(e) => setPreferredFish(e.target.value)}
                  placeholder="e.g., Red Snapper, Grouper, Mahi Mahi (or leave blank for all types)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple types with commas
                </p>
              </div>

              <div>
                <Label htmlFor="deliveryPreferences">Delivery Preferences</Label>
                <Input
                  id="deliveryPreferences"
                  value={deliveryPreferences}
                  onChange={(e) => setDeliveryPreferences(e.target.value)}
                  placeholder="e.g., Weekday evenings, Saturday mornings"
                />
              </div>

              <div>
                <Label>Communication Preferences</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={communicationPrefs.includes('SMS')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCommunicationPrefs([...communicationPrefs, 'SMS']);
                        } else {
                          setCommunicationPrefs(communicationPrefs.filter(p => p !== 'SMS'));
                        }
                      }}
                      className="rounded"
                    />
                    <span>SMS/Text Messages</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={communicationPrefs.includes('Email')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCommunicationPrefs([...communicationPrefs, 'Email']);
                        } else {
                          setCommunicationPrefs(communicationPrefs.filter(p => p !== 'Email'));
                        }
                      }}
                      className="rounded"
                    />
                    <span>Email Notifications</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="specialRequests">Special Requests or Notes</Label>
                <Textarea
                  id="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requirements, preparation preferences, or notes..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={alertsSubmitting} className="w-full" size="lg">
                {alertsSubmitting ? "Signing Up..." : "Join Fresh Fish Alerts"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                We respect your privacy and will only contact you about fresh fish availability.
                You can unsubscribe at any time.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreshCatch;