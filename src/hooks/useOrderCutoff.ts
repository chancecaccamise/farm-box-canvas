import { useState, useEffect } from "react";

interface CutoffStatus {
  cutoffTime: Date | null;
  isPastCutoff: boolean;
  canPlaceOrderThisWeek: boolean;
  nextWeekStart: Date | null;
  formattedCutoffTime: string;
}

/**
 * Hook to check order cutoff status
 * Cutoff is Friday at noon EST each week
 */
export function useOrderCutoff(): CutoffStatus {
  const [status, setStatus] = useState<CutoffStatus>({
    cutoffTime: null,
    isPastCutoff: false,
    canPlaceOrderThisWeek: true,
    nextWeekStart: null,
    formattedCutoffTime: "",
  });

  useEffect(() => {
    const calculateCutoff = () => {
      const now = new Date();
      
      // Get current week's Friday at noon EST
      const currentDay = now.getDay(); // 0 = Sunday, 5 = Friday
      const daysUntilFriday = (5 - currentDay + 7) % 7;
      
      const friday = new Date(now);
      friday.setDate(now.getDate() + daysUntilFriday);
      
      // Set to noon EST (17:00 UTC during EST, 16:00 UTC during EDT)
      // Using a fixed offset approach for simplicity
      friday.setHours(12, 0, 0, 0);
      
      // Convert to EST/EDT - create a date string and parse it in EST
      const fridayEST = new Date(friday.toLocaleString("en-US", { timeZone: "America/New_York" }));
      
      // If today is Friday and we're past noon, or if Friday already passed this week
      const nowInEST = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      
      // Recalculate cutoff in EST
      const cutoffDate = new Date(fridayEST);
      cutoffDate.setHours(12, 0, 0, 0);
      
      // Check if past cutoff
      const isPast = nowInEST > cutoffDate || (currentDay === 5 && nowInEST.getHours() >= 12);
      
      // If past Friday noon, the cutoff was this Friday
      // Calculate next week's Monday
      const nextMonday = new Date(now);
      const daysUntilMonday = (8 - currentDay) % 7 || 7; // Next Monday
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      
      // Format the cutoff time
      const formattedCutoff = cutoffDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      }) + " EST";

      setStatus({
        cutoffTime: cutoffDate,
        isPastCutoff: isPast,
        canPlaceOrderThisWeek: !isPast,
        nextWeekStart: isPast ? nextMonday : null,
        formattedCutoffTime: formattedCutoff,
      });
    };

    calculateCutoff();
    
    // Recalculate every minute
    const interval = setInterval(calculateCutoff, 60000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
