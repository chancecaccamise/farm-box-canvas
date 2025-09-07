import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Fish } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCheckout } from "@/contexts/CheckoutContext";
import { ProteinSelector } from "@/components/ProteinSelector";

const ProteinSelection = () => {
  const [selectedProteins, setSelectedProteins] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateProteinSelections, checkoutState } = useCheckout();

  useEffect(() => {
    // Initialize with existing selections from checkout context
    setSelectedProteins(checkoutState.proteinSelections || []);
  }, [checkoutState.proteinSelections]);

  const handleSelectionChange = (proteins: string[]) => {
    setSelectedProteins(proteins);
  };

  const handleContinue = () => {
    if (selectedProteins.length !== 5) {
      toast({
        title: "Selection Required",
        description: "Please select exactly 5 proteins for your seafood pack.",
        variant: "destructive",
      });
      return;
    }

    updateProteinSelections(selectedProteins);
    navigate("/add-ons");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
            <Fish className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Select Your Proteins</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose 5 premium proteins from our weekly selection of fresh seafood and meats
          </p>
        </div>

        {/* Protein Selector */}
        <ProteinSelector
          maxSelections={5}
          onSelectionChange={handleSelectionChange}
          currentSelections={selectedProteins}
        />

        {/* Continue Button */}
        <div className="text-center mt-12">
          <Button 
            onClick={handleContinue}
            variant="hero"
            size="xl"
            className="w-full md:w-auto"
            disabled={selectedProteins.length !== 5}
          >
            Continue to Add-ons ({selectedProteins.length}/5 selected)
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            You must select exactly 5 proteins to continue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProteinSelection;