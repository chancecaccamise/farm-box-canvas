import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, AlertTriangle } from "lucide-react";

interface PaymentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBoxSize: string;
  newBoxSize: string;
  currentPrice: number;
  newPrice: number;
  onConfirm: () => Promise<void>;
  isConfirmed?: boolean;
}

export function PaymentConfirmationDialog({
  open,
  onOpenChange,
  currentBoxSize,
  newBoxSize,
  currentPrice,
  newPrice,
  onConfirm,
  isConfirmed = false,
}: PaymentConfirmationDialogProps) {
  const [confirming, setConfirming] = useState(false);
  const priceDifference = newPrice - currentPrice;
  const isUpgrade = priceDifference > 0;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error confirming payment change:', error);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span>
              {isUpgrade ? "Confirm Subscription Upgrade" : "Confirm Box Size Change"}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                You're changing your box size from <strong>{currentBoxSize}</strong> to{" "}
                <strong>{newBoxSize}</strong>.
              </p>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Current: {currentBoxSize}</span>
                  <span>${currentPrice.toFixed(2)}/week</span>
                </div>
                <div className="flex justify-between">
                  <span>New: {newBoxSize}</span>
                  <span>${newPrice.toFixed(2)}/week</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>
                    {isUpgrade ? "Additional charge:" : "Savings:"}
                  </span>
                  <span className={isUpgrade ? "text-destructive" : "text-accent"}>
                    {isUpgrade ? "+" : "-"}${Math.abs(priceDifference).toFixed(2)}/week
                  </span>
                </div>
              </div>

              {isUpgrade && (
                <div className="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">Payment Required</p>
                    <p>
                      Your subscription will be updated and you'll be charged the difference
                      starting with your next billing cycle.
                    </p>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                {isConfirmed ? (
                  <div className="flex items-center space-x-2 p-2 bg-amber-50 border border-amber-200 rounded">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-800">
                      This week's bag is already confirmed. Changes will apply to next week's delivery.
                    </span>
                  </div>
                ) : (
                  <p>
                    Changes will apply to your current week's bag and future deliveries.
                  </p>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={confirming}>
            {confirming ? "Processing..." : isUpgrade ? "Upgrade Subscription" : "Confirm Change"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}