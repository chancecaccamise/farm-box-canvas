
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface UnconfirmBagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  boxSize: string;
}

export function UnconfirmBagDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading,
  boxSize 
}: UnconfirmBagDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error unconfirming bag:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Unconfirm Your Bag
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 mb-1">What happens when you unconfirm:</p>
                <ul className="text-amber-800 space-y-1">
                  <li>• Your bag will be reopened for modifications</li>
                  <li>• Box contents will sync with latest {boxSize} box template</li>
                  <li>• Your add-ons will be preserved</li>
                  <li>• You can make changes until the cutoff time</li>
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground">
              Are you sure you want to unconfirm your bag for this week?
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing || loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isProcessing || loading}
            className="bg-primary hover:bg-primary/90"
          >
            {isProcessing || loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Unconfirming...
              </>
            ) : (
              "Yes, Unconfirm Bag"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
