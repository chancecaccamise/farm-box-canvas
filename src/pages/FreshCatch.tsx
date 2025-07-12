import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Fish, Phone, User } from "lucide-react";

interface FreshCatchAnnouncement {
  id: string;
  fish_name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

const FreshCatch = () => {
  const [announcements, setAnnouncements] = useState<FreshCatchAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertsSubmitting, setAlertsSubmitting] = useState(false);
  const { toast } = useToast();

  // Admin form state
  const [fishName, setFishName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // SMS alerts form state
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fresh catch announcement posted!",
      });

      setFishName("");
      setDescription("");
      setImageUrl("");
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
    if (!name.trim() || !phoneNumber.trim()) return;

    setAlertsSubmitting(true);
    try {
      const { error } = await supabase
        .from("fresh_fish_alerts")
        .insert({
          name: name,
          phone_number: phoneNumber,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You've been signed up for fresh fish alerts!",
      });

      setName("");
      setPhoneNumber("");
    } catch (error) {
      console.error("Error signing up for alerts:", error);
      toast({
        title: "Error",
        description: "Failed to sign up for alerts",
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

        {/* Admin Form (Simple version for development) */}
        <Card className="mb-12 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fish className="h-5 w-5" />
              Post New Catch
            </CardTitle>
            <CardDescription>
              Add a new fresh catch announcement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
              <div>
                <Label htmlFor="fishName">Fish Name</Label>
                <Input
                  id="fishName"
                  value={fishName}
                  onChange={(e) => setFishName(e.target.value)}
                  placeholder="e.g., Red Snapper"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fresh from the Savannah coast..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/fish-image.jpg"
                  type="url"
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Posting..." : "Post Announcement"}
              </Button>
            </form>
          </CardContent>
        </Card>

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

        {/* SMS Alerts Signup */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Phone className="h-5 w-5" />
              Want Fresh Fish Alerts?
            </CardTitle>
            <CardDescription>
              Be the first to know when new fish come in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSMSSignup} className="space-y-4">
              <div>
                <Label htmlFor="alertName">Name</Label>
                <Input
                  id="alertName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  type="tel"
                  required
                />
              </div>
              <Button type="submit" disabled={alertsSubmitting} className="w-full">
                {alertsSubmitting ? "Signing Up..." : "Sign Me Up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreshCatch;