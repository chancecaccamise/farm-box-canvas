import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Fish } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCheckout } from "@/contexts/CheckoutContext";
import { ProteinSelector } from "@/components/ProteinSelector";

const FullFarmBagProteinSelection = () => {
  const [selectedProteins, setSelectedProteins] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateProteinSelections, checkoutState } = useCheckout();

  useEffect(() => {
    // Initialize with existing selections from checkout context
    if (checkoutState.proteinSelections) {
      setSelectedProteins(checkoutState.proteinSelections);
    }
  }, [checkoutState.proteinSelections]);

  const handleSelectionChange = (proteins: string[]) => {
    setSelectedProteins(proteins);
  };

  const handleContinue = () => {
    if (selectedProteins.length !== 1) {
      toast({
        title: "Selection Required",
        description: "Please select exactly 1 protein for your full farm bag.",
        variant: "destructive",
      });
      return;
    }

    updateProteinSelections(selectedProteins);
    navigate("/full-farm-bag-carb-selection");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/box-selection')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
            <Fish className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Select Your Protein</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose exactly 1 premium protein for your full farm bag experience
          </p>
        </div>

        {/* Protein Selection */}
        <div className="mb-12">
          <ProteinSelector
            maxSelections={1}
            onSelectionChange={handleSelectionChange}
            currentSelections={selectedProteins}
          />
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            variant="hero"
            size="xl"
            className="w-full md:w-auto"
            disabled={selectedProteins.length !== 1}
          >
            Continue to Carb Selection ({selectedProteins.length}/1 selected)
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            You must select exactly 1 protein to continue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FullFarmBagProteinSelection;