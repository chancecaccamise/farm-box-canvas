import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Heart, Star, Leaf } from "lucide-react";
import billysLogo from "@/assets/billysBotanicals-Logo-v1.png";

const GiftCards = () => {
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    senderName: "",
    amount: "",
    message: ""
  });

  const giftAmounts = [
    { value: "50", label: "$50" },
    { value: "75", label: "$75" },
    { value: "100", label: "$100" },
    { value: "150", label: "$150" },
    { value: "200", label: "$200" },
    { value: "custom", label: "Custom Amount" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Gift Cards</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share the joy of fresh, local food with friends and family
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Side - Gift Card Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send a Digital Gift Card</CardTitle>
                <CardDescription>
                  Perfect for food lovers who appreciate farm-fresh ingredients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipient Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Recipient Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipient-name">Recipient Name</Label>
                    <Input
                      id="recipient-name"
                      placeholder="Who are you sending this to?"
                      value={formData.recipientName}
                      onChange={(e) => handleInputChange("recipientName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient-email">Recipient Email</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      placeholder="recipient@example.com"
                      value={formData.recipientEmail}
                      onChange={(e) => handleInputChange("recipientEmail", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender-name">Your Name</Label>
                    <Input
                      id="sender-name"
                      placeholder="Your name"
                      value={formData.senderName}
                      onChange={(e) => handleInputChange("senderName", e.target.value)}
                    />
                  </div>
                </div>

                {/* Gift Amount */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Gift Amount</h3>
                  
                  <Select value={formData.amount} onValueChange={(value) => handleInputChange("amount", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gift amount" />
                    </SelectTrigger>
                    <SelectContent>
                      {giftAmounts.map((amount) => (
                        <SelectItem key={amount.value} value={amount.value}>
                          {amount.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formData.amount === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-amount">Custom Amount</Label>
                      <Input
                        id="custom-amount"
                        type="number"
                        placeholder="Enter amount"
                        min="25"
                        max="500"
                      />
                    </div>
                  )}
                </div>

                {/* Personal Message */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Message</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Write a personal message..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      maxLength={250}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.message.length}/250 characters
                    </p>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <Gift className="w-4 h-4 mr-2" />
                  Send Gift Card
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Preview & Information */}
          <div className="space-y-6">
            {/* Gift Card Preview */}
            <Card>
  <CardHeader>
    <CardTitle>Gift Card Preview</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="bg-gradient-primary rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <img 
            src={billysLogo} 
            alt="Billy's Botanicals Logo"
            className="h-8 w-auto object-contain bg-white rounded-sm p-1"
          />
          <span className="font-bold text-lg">Billy&apos;s Botanicals</span>
        </div>
        <Gift className="w-6 h-6" />
      </div>
      
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">
          {formData.amount && formData.amount !== "custom" ? `$${formData.amount}` : "$50"} Gift Card
        </h3>
        <p className="text-white/80">Farm Fresh Ingredients Delivered</p>
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <strong>To:</strong> {formData.recipientName || "Recipient Name"}
        </p>
        <p>
          <strong>From:</strong> {formData.senderName || "Your Name"}
        </p>
        {formData.message && (
          <div className="mt-4 p-3 bg-white/10 rounded text-sm">
            "{formData.message}"
          </div>
        )}
      </div>
    </div>
  </CardContent>
</Card>

            {/* Gift Card Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Give a FarmBox Gift Card?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-accent mt-1" />
                  <div>
                    <h4 className="font-semibold">Thoughtful & Healthy</h4>
                    <p className="text-sm text-muted-foreground">
                      Give the gift of fresh, nutritious food that supports their wellness
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Leaf className="w-5 h-5 text-accent mt-1" />
                  <div>
                    <h4 className="font-semibold">Supports Local Farmers</h4>
                    <p className="text-sm text-muted-foreground">
                      Every purchase directly supports small, local farms in our community
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-accent mt-1" />
                  <div>
                    <h4 className="font-semibold">Flexible & Convenient</h4>
                    <p className="text-sm text-muted-foreground">
                      Recipients can customize their boxes and choose delivery dates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gift Card Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Gift cards are delivered digitally via email</p>
                <p>• Valid for 12 months from purchase date</p>
                <p>• Can be used for any farm box or individual items</p>
                <p>• No expiration fees or dormancy charges</p>
                <p>• Non-refundable but transferable</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCards;