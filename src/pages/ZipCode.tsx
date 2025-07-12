import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ZipCode = () => {
  const [zipCode, setZipCode] = useState("");
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 5) {
      setZipCode(value);
      setIsValid(value.length === 5);
    }
  };

  const handleContinue = () => {
    if (isValid) {
      navigate("/account");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-muted rounded-full"></div>
            <div className="w-3 h-3 bg-muted rounded-full"></div>
          </div>
          <span className="ml-4 text-sm text-muted-foreground">Step 1 of 3</span>
        </div>

        {/* Main Card */}
        <Card className="shadow-strong">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Check Delivery Area</CardTitle>
            <CardDescription className="text-base">
              Enter your ZIP code to see if we deliver to your area
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="zipcode" className="text-base font-medium">
                ZIP Code
              </Label>
              <Input
                id="zipcode"
                type="text"
                value={zipCode}
                onChange={handleZipChange}
                placeholder="Enter ZIP code"
                className="text-lg h-12"
                maxLength={5}
              />
              {zipCode.length > 0 && zipCode.length < 5 && (
                <p className="text-sm text-muted-foreground">
                  Please enter a 5-digit ZIP code
                </p>
              )}
              {isValid && (
                <p className="text-sm text-primary flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  Great! We deliver to your area.
                </p>
              )}
            </div>

            <Button 
              onClick={handleContinue}
              disabled={!isValid}
              className="w-full h-12 text-base"
              variant="hero"
            >
              Continue to Account Setup
            </Button>

            <div className="bg-secondary/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Delivery Areas</h4>
              <p className="text-sm text-muted-foreground">
                We currently deliver to most areas within 50 miles of our partner farms. 
                Delivery is available Tuesday through Saturday.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ZipCode;