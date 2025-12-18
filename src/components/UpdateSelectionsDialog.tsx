import { useState, useEffect, useMemo } from "react";
import { RefreshCw, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProteinSelector } from "@/components/ProteinSelector";
import { CarbSelector } from "@/components/CarbSelector";
import { format } from "date-fns";

interface UpdateSelectionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boxSize: string;
  weeklyBagId: string;
  weekStartDate: string;
  cutoffTime?: string | null;
  currentProtein?: string | null;
  currentCarb?: string | null;
  currentProteinSelections?: string[] | null;
  onSelectionsUpdated: () => void;
}

export function UpdateSelectionsDialog({
  isOpen,
  onClose,
  boxSize,
  weeklyBagId,
  weekStartDate,
  cutoffTime,
  currentProtein,
  currentCarb,
  currentProteinSelections,
  onSelectionsUpdated,
}: UpdateSelectionsDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // For full_farm_bag: single protein and carb
  const [selectedProtein, setSelectedProtein] = useState<Record<string, number>>({});
  const [selectedCarbs, setSelectedCarbs] = useState<string[]>([]);
  
  // For protein-pack: 5 proteins
  const [selectedProteins, setSelectedProteins] = useState<Record<string, number>>({});

  // Initialize selections from current values
  useEffect(() => {
    if (isOpen) {
      if (boxSize === 'full_farm_bag') {
        // Set current protein selection
        if (currentProtein) {
          setSelectedProtein({ [currentProtein]: 1 });
        } else {
          setSelectedProtein({});
        }
        // Set current carb selection
        if (currentCarb) {
          setSelectedCarbs([currentCarb]);
        } else {
          setSelectedCarbs([]);
        }
      } else if (boxSize === 'protein-pack') {
        // Convert array of protein IDs to quantity record
        if (currentProteinSelections && currentProteinSelections.length > 0) {
          const proteinQuantities: Record<string, number> = {};
          currentProteinSelections.forEach(id => {
            proteinQuantities[id] = (proteinQuantities[id] || 0) + 1;
          });
          setSelectedProteins(proteinQuantities);
        } else {
          setSelectedProteins({});
        }
      }
    }
  }, [isOpen, boxSize, currentProtein, currentCarb, currentProteinSelections]);

  const getProteinCount = () => {
    return Object.values(selectedProteins).reduce((sum, qty) => sum + qty, 0);
  };

  const getSingleProteinCount = () => {
    return Object.values(selectedProtein).reduce((sum, qty) => sum + qty, 0);
  };

  const isValid = () => {
    if (boxSize === 'full_farm_bag') {
      return getSingleProteinCount() === 1 && selectedCarbs.length === 1;
    } else if (boxSize === 'protein-pack') {
      return getProteinCount() === 5;
    }
    return false;
  };

  // Check if cutoff has passed
  const isPastCutoff = useMemo(() => {
    if (!cutoffTime) return false;
    return new Date() > new Date(cutoffTime);
  }, [cutoffTime]);

  // Format cutoff time for display
  const formattedCutoffTime = useMemo(() => {
    if (!cutoffTime) return null;
    try {
      return format(new Date(cutoffTime), "EEEE, MMMM d 'at' h:mm a");
    } catch {
      return null;
    }
  }, [cutoffTime]);

  const handleSave = async () => {
    if (!isValid() || isPastCutoff) return;

    setSaving(true);

    try {
      // Server-side cutoff validation
      const { data: bagData } = await supabase
        .from('weekly_bags')
        .select('cutoff_time')
        .eq('id', weeklyBagId)
        .single();

      if (bagData) {
        const serverCutoffTime = new Date(bagData.cutoff_time);
        const now = new Date();
        if (now > serverCutoffTime) {
          toast({
            title: "Cutoff Time Passed",
            description: "The deadline to change selections has passed. Your choices are locked.",
            variant: "destructive",
          });
          onClose();
          return;
        }
      }
    } catch (error) {
      console.error("Error validating cutoff:", error);
    }
    try {
      const updateData: Record<string, unknown> = {};
      const orderUpdateData: Record<string, unknown> = {};

      if (boxSize === 'full_farm_bag') {
        const proteinId = Object.keys(selectedProtein)[0];
        const carbId = selectedCarbs[0];
        updateData.user_full_farm_bag_protein = proteinId;
        updateData.user_full_farm_bag_carb = carbId;
        orderUpdateData.user_full_farm_bag_protein = proteinId;
        orderUpdateData.user_full_farm_bag_carb = carbId;
      } else if (boxSize === 'protein-pack') {
        // Convert quantity record back to array (with duplicates for quantities > 1)
        const proteinArray: string[] = [];
        Object.entries(selectedProteins).forEach(([id, qty]) => {
          for (let i = 0; i < qty; i++) {
            proteinArray.push(id);
          }
        });
        updateData.user_protein_selections = proteinArray;
        orderUpdateData.user_protein_selections = proteinArray;
      }

      // Update weekly_bags with new selections
      const { error: updateError } = await supabase
        .from('weekly_bags')
        .update(updateData)
        .eq('id', weeklyBagId);

      if (updateError) throw updateError;

      // Sync selections to the linked orders table for admin dashboard
      const { error: orderError } = await supabase
        .from('orders')
        .update(orderUpdateData)
        .eq('weekly_bag_id', weeklyBagId);

      if (orderError) {
        console.error('Error syncing to order:', orderError);
        // Don't throw - weekly_bags is updated, order sync is secondary
      }

      // Call RPC to repopulate bag from template with new selections
      const { error: rpcError } = await supabase.rpc('populate_weekly_bag_from_template', {
        bag_id: weeklyBagId,
        box_size_name: boxSize,
        week_start: weekStartDate
      });

      if (rpcError) throw rpcError;

      toast({
        title: "Selections Updated!",
        description: boxSize === 'full_farm_bag' 
          ? "Your protein and carb choices have been updated."
          : "Your protein selections have been updated.",
      });

      onSelectionsUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating selections:", error);
      toast({
        title: "Error",
        description: "Failed to update selections. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            {boxSize === 'full_farm_bag' 
              ? 'Update Your Protein & Carb' 
              : 'Update Your 5 Proteins'}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span>
              {boxSize === 'full_farm_bag'
                ? 'Choose a new protein and carb for this week\'s bag.'
                : 'Select 5 proteins for this week\'s protein pack.'}
            </span>
            {formattedCutoffTime && !isPastCutoff && (
              <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                <Clock className="w-4 h-4" />
                Changes must be made before {formattedCutoffTime}
              </span>
            )}
            {isPastCutoff && (
              <span className="flex items-center gap-1.5 text-destructive font-medium">
                <Clock className="w-4 h-4" />
                The cutoff time has passed. Changes are no longer allowed.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {boxSize === 'full_farm_bag' && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-3">Select Your Protein (1)</h3>
                <ProteinSelector
                  maxSelections={1}
                  currentSelections={selectedProtein}
                  onSelectionChange={setSelectedProtein}
                  weekStartDate={weekStartDate}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Select Your Carb (1)</h3>
                <CarbSelector
                  maxSelections={1}
                  currentSelections={selectedCarbs}
                  onSelectionChange={setSelectedCarbs}
                  weekStartDate={weekStartDate}
                />
              </div>
            </>
          )}

          {boxSize === 'protein-pack' && (
            <div>
              <h3 className="text-lg font-medium mb-3">Select Your 5 Proteins</h3>
              <ProteinSelector
                maxSelections={5}
                currentSelections={selectedProteins}
                onSelectionChange={setSelectedProteins}
                weekStartDate={weekStartDate}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid() || saving || isPastCutoff}>
            {isPastCutoff ? "Cutoff Passed" : saving ? "Saving..." : "Save Selections"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
