import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wheat } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCheckout } from "@/contexts/CheckoutContext";
import { CarbSelector } from "@/components/CarbSelector";

const FullFarmBagCarbSelection = () => {
  const [selectedCarbs, setSelectedCarbs] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateCarbSelections, updateFullFarmBagSelections, checkoutState } = useCheckout();

  useEffect(() => {
    // Initialize with existing selections from checkout context
    if (checkoutState.carbSelections) {
      setSelectedCarbs(checkoutState.carbSelections);
    }
  }, [checkoutState.carbSelections]);

  const handleSelectionChange = (carbs: string[]) => {
    setSelectedCarbs(carbs);
  };

  const handleContinue = () => {
    if (selectedCarbs.length !== 1) {
      toast({
        title: "Selection Required",
        description: "Please select exactly 1 carb for your full farm bag.",
        variant: "destructive",
      });
      return;
    }

    // Update carb selections and combine with protein for full farm bag
    updateCarbSelections(selectedCarbs);
    
    // Combine protein and carb selections into fullFarmBagSelections
    const protein = checkoutState.proteinSelections[0];
    const carb = selectedCarbs[0];
    
    if (protein && carb) {
      updateFullFarmBagSelections({ protein, carb });
    }
    
    navigate("/box-comments");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/full-farm-bag-protein-selection')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
            <Wheat className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Select Your Carb</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose exactly 1 fresh carb to complete your full farm bag
          </p>
        </div>

        {/* Carb Selection */}
        <div className="mb-12">
          <CarbSelector
            maxSelections={1}
            onSelectionChange={handleSelectionChange}
            currentSelections={selectedCarbs}
          />
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            variant="hero"
            size="xl"
            className="w-full md:w-auto"
            disabled={selectedCarbs.length !== 1}
          >
            Continue to Special Requests ({selectedCarbs.length}/1 selected)
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            You must select exactly 1 carb to continue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FullFarmBagCarbSelection;