
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PaymentForm, { PaymentData } from "@/components/checkout/PaymentForm";
import DeliveryForm, { DeliveryData } from "@/components/checkout/DeliveryForm";
import SimplifiedOrderSummary from "@/components/checkout/SimplifiedOrderSummary";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);

  // Get data passed from MyBag page
  const { weeklyBag, bagItems, hasActiveSubscription } = location.state || {};

  useEffect(() => {
    // Redirect back to MyBag if no data is provided
    if (!weeklyBag || !bagItems) {
      navigate('/my-bag');
    }
  }, [weeklyBag, bagItems, navigate]);

  if (!weeklyBag || !bagItems) {
    return null; // Will redirect
  }

  const total = (() => {
    const boxPrice = weeklyBag.box_price || 0;
    const addonsTotal = weeklyBag.addons_total || 0;
    const deliveryFee = hasActiveSubscription ? 0 : 4.99;
    
    if (hasActiveSubscription) {
      return addonsTotal; // Only charge for add-ons
    } else {
      return boxPrice + addonsTotal + deliveryFee; // Charge for everything
    }
  })();

  const handlePaymentSubmit = (data: PaymentData) => {
    setPaymentData(data);
  };

  const handleDeliverySubmit = (data: DeliveryData) => {
    setDeliveryData(data);
  };

  const handleFinalCheckout = async () => {
    if (!paymentData || !deliveryData) {
      return;
    }

    setLoading(true);
    // TODO: Integrate with Stripe here
    console.log('Processing payment...', {
      payment: paymentData,
      delivery: deliveryData,
      total,
      hasActiveSubscription,
      itemsCount: bagItems.length
    });
    
    // Simulate processing delay
    setTimeout(() => {
      setLoading(false);
      // TODO: Navigate to success page after successful payment
      navigate('/my-bag');
    }, 2000);
  };

  const canProceedToPayment = paymentData && deliveryData;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/my-bag')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Bag
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
              <p className="text-muted-foreground">
                Complete your order
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side: Forms */}
            <div className="lg:col-span-2 space-y-6">
              <DeliveryForm 
                onSubmit={handleDeliverySubmit}
                loading={loading}
              />
              
              <PaymentForm 
                onSubmit={handlePaymentSubmit}
                loading={loading}
              />

              {/* Complete Order Button */}
              <div className="pt-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleFinalCheckout}
                  disabled={loading || !canProceedToPayment || total === 0}
                >
                  {loading ? (
                    "Processing..."
                  ) : total === 0 ? (
                    "Complete Order - No Payment Required"
                  ) : (
                    `Complete Order - $${total.toFixed(2)}`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  By proceeding, you agree to our{" "}
                  <Link to="/terms" className="underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>

            {/* Right Side: Order Summary */}
            <div className="lg:col-span-1">
              <SimplifiedOrderSummary
                weeklyBag={weeklyBag}
                bagItems={bagItems}
                hasActiveSubscription={hasActiveSubscription}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
