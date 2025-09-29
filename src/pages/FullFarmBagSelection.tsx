import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wheat, Fish } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCheckout } from "@/contexts/CheckoutContext";
import { ProteinSelector } from "@/components/ProteinSelector";
import { CarbSelector } from "@/components/CarbSelector";

const FullFarmBagSelection = () => {
  const [selectedProtein, setSelectedProtein] = useState<string>('');
  const [selectedCarb, setSelectedCarb] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateFullFarmBagSelections, checkoutState } = useCheckout();

  useEffect(() => {
    // Initialize with existing selections from checkout context
    if (checkoutState.fullFarmBagSelections?.protein) {
      setSelectedProtein(checkoutState.fullFarmBagSelections.protein);
    }
    if (checkoutState.fullFarmBagSelections?.carb) {
      setSelectedCarb(checkoutState.fullFarmBagSelections.carb);
    }
  }, [checkoutState.fullFarmBagSelections]);

  const handleProteinSelectionChange = (proteins: Record<string, number>) => {
    // Get the first (and only) protein ID
    const proteinId = Object.keys(proteins)[0] || '';
    setSelectedProtein(proteinId);
  };

  const handleCarbSelectionChange = (carbs: string[]) => {
    const carb = carbs[0] || '';
    setSelectedCarb(carb);
  };

  const handleContinue = () => {
    if (!selectedProtein || !selectedCarb) {
      toast({
        title: "Selection Required",
        description: "Please select both 1 protein and 1 carb for your full farm bag.",
        variant: "destructive",
      });
      return;
    }

    updateFullFarmBagSelections({ protein: selectedProtein, carb: selectedCarb });
    navigate("/add-ons");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" asChild>
            <Link to="/box-selection">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Box Selection
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="flex items-center space-x-1">
              <Fish className="w-4 h-4 text-white" />
              <Wheat className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Complete Your Full Farm Bag</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select 1 premium protein and 1 fresh carb to complete your full farm experience
          </p>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Protein Selection */}
          <div>
            <ProteinSelector
              maxSelections={1}
              onSelectionChange={handleProteinSelectionChange}
              currentSelections={selectedProtein ? { [selectedProtein]: 1 } : {}}
            />
          </div>

          {/* Carb Selection */}
          <div>
            <CarbSelector
              maxSelections={1}
              onSelectionChange={handleCarbSelectionChange}
              currentSelections={selectedCarb ? [selectedCarb] : []}
            />
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            variant="hero"
            size="xl"
            className="w-full md:w-auto"
            disabled={!selectedProtein || !selectedCarb}
          >
            Continue to Add-ons ({selectedProtein && selectedCarb ? '2/2' : `${(selectedProtein ? 1 : 0) + (selectedCarb ? 1 : 0)}/2`} selected)
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            You must select exactly 1 protein and 1 carb to continue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FullFarmBagSelection;