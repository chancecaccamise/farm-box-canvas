import { AlertTriangle, Clock, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

interface CutoffBannerProps {
  isPastCutoff: boolean;
  nextWeekStart: Date | null;
  variant?: "warning" | "info";
}

export function CutoffBanner({ isPastCutoff, nextWeekStart, variant = "warning" }: CutoffBannerProps) {
  if (!isPastCutoff) return null;

  const nextDeliveryDate = nextWeekStart 
    ? format(nextWeekStart, "MMMM d, yyyy")
    : "next week";

  if (variant === "info") {
    return (
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Calendar className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Ordering for Next Week</AlertTitle>
        <AlertDescription className="text-blue-700">
          This week's order cutoff has passed. Your order will be scheduled for delivery 
          the week of {nextDeliveryDate}.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Order Cutoff Has Passed</AlertTitle>
      <AlertDescription className="text-amber-700">
        The cutoff for this week's orders was Friday at noon. Your order will be 
        scheduled for delivery the week of {nextDeliveryDate}.
      </AlertDescription>
    </Alert>
  );
}
