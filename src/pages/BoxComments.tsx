import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "@/contexts/CheckoutContext";

const BoxComments = () => {
  const { checkoutState, updateComments } = useCheckout();
  const [comments, setComments] = useState(checkoutState.comments || "");
  const navigate = useNavigate();

  useEffect(() => {
    updateComments(comments);
  }, [comments, updateComments]);

  const handleContinue = () => {
    // Always go to add-ons since comments is now always before add-ons
    navigate("/add-ons");
  };

  const handleBack = () => {
    // Navigate back based on box type
    if (checkoutState.boxSize === 'protein-pack') {
      navigate("/protein-selection");
    } else if (checkoutState.boxSize === 'full_farm_bag') {
      navigate("/full-farm-bag-carb-selection");
    } else {
      navigate("/box-selection");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-muted rounded-full"></div>
          </div>
          <span className="ml-4 text-sm text-muted-foreground">Step 2 of 3</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Special Requests</h1>
          <p className="text-xl text-muted-foreground">
            Let Billy & Ana know about any allergies, dietary preferences, or special requests
          </p>
        </div>

        {/* Comments Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Comments & Requests</CardTitle>
            <CardDescription>
              Share any specific requests, allergies, dietary restrictions, or substitution preferences. 
              Billy & Ana will do their best to accommodate your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="comments" className="text-base font-medium">
                Your message to Billy & Ana
              </Label>
              <Textarea
                id="comments"
                placeholder="Example: Please avoid mushrooms due to allergies. I'd love extra herbs if available. My family loves spicy items!"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-[120px] mt-2"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  Examples: Allergies, dietary restrictions, substitution requests, family preferences
                </p>
                <span className="text-sm text-muted-foreground">
                  {comments.length}/500
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Tips */}
        <Card className="mb-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">💡 Helpful Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Allergies:</strong> Please mention any food allergies or sensitivities</li>
              <li>• <strong>Preferences:</strong> Let us know what your family loves or dislikes</li>
              <li>• <strong>Substitutions:</strong> Request specific items you'd prefer instead of others</li>
              <li>• <strong>Quantity:</strong> Need extra of something? Just ask!</li>
            </ul>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            variant="hero"
            size="xl"
            className="w-full md:w-auto"
          >
            Continue
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Comments are optional but help us serve you better
          </p>
        </div>
      </div>
    </div>
  );
};

export default BoxComments;