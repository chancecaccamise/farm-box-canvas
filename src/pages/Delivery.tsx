import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Truck, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCheckout } from "@/contexts/CheckoutContext";

type DeliveryDay = {
  id: string;
  day: string;
  date: string;
  available: boolean;
  popular?: boolean;
};

const Delivery = () => {
  const [selectedDay, setSelectedDay] = useState<string>("");
  const navigate = useNavigate();
  const { checkoutState, updateDeliveryDay } = useCheckout();

  // Delivery options limited to Thursday, Saturday, and Sunday
  const deliveryDays: DeliveryDay[] = [
    {
      id: "thursday",
      day: "Thursday", 
      date: "Jan 18",
      available: true,
      popular: true
    },
    {
      id: "saturday",
      day: "Saturday",
      date: "Jan 20",
      available: true
    },
    {
      id: "sunday",
      day: "Sunday",
      date: "Jan 21",
      available: true,
      popular: true
    }
  ];

  const handleContinue = () => {
    if (!selectedDay) return;
    
    const selectedDayData = deliveryDays.find(day => day.id === selectedDay);
    if (selectedDayData) {
      updateDeliveryDay(`${selectedDayData.day}, ${selectedDayData.date}`);
      navigate("/order-summary");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" asChild>
            <Link to="/add-ons">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Choose Your Delivery Day</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your preferred delivery day. We'll deliver fresh ingredients right to your door.
          </p>
        </div>

        {/* Delivery Info Card */}
        <Card className="mb-8 shadow-soft">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Weekly Delivery</h3>
                <p className="text-sm text-muted-foreground">Same day each week</p>
              </div>
              <div>
                <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Morning Delivery</h3>
                <p className="text-sm text-muted-foreground">Between 8 AM - 12 PM</p>
              </div>
              <div>
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Always Fresh</h3>
                <p className="text-sm text-muted-foreground">Packed the night before</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Days Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {deliveryDays.map((day) => (
            <Card
              key={day.id}
              className={`cursor-pointer transition-all duration-300 ${
                !day.available 
                  ? "opacity-50 cursor-not-allowed" 
                  : selectedDay === day.id
                    ? "ring-2 ring-primary shadow-medium"
                    : "hover:shadow-medium"
              }`}
              onClick={() => day.available && setSelectedDay(day.id)}
            >
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-lg">{day.day}</CardTitle>
                  {day.popular && day.available && (
                    <Badge variant="secondary" className="text-xs">Most Popular</Badge>
                  )}
                </div>
                <CardDescription className="text-base font-medium">
                  {day.date}
                </CardDescription>
                {selectedDay === day.id && (
                  <CheckCircle className="w-6 h-6 text-primary mx-auto mt-2" />
                )}
              </CardHeader>
              <CardContent className="text-center pt-0">
                {!day.available ? (
                  <Badge variant="destructive" className="text-xs">
                    Not Available
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    8 AM - 12 PM
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delivery Instructions */}
        <Card className="mb-8 bg-secondary/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Delivery Instructions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Deliveries are made between 8 AM and 12 PM on your selected day</li>
              <li>• No signature required - we'll leave your box in a safe location</li>
              <li>• You'll receive a text notification when your box is delivered</li>
              <li>• Refrigerated items are packed with ice packs to stay fresh</li>
              <li>• You can change your delivery day anytime before the weekly cutoff</li>
            </ul>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            disabled={!selectedDay}
            variant="hero"
            size="xl"
            className="w-full md:w-auto"
          >
            Continue to Order Summary
            <CheckCircle className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Please select a delivery day to continue with your order.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Delivery;