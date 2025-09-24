import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function SubscriptionRecovery() {
  const [isRecovering, setIsRecovering] = useState(false);
  const { toast } = useToast();

  const handleRecovery = async () => {
    try {
      setIsRecovering(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to recover subscriptions",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('manual-webhook-recovery', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      const result = data as { message: string; recoveredOrders: any[]; totalProcessed: number };
      
      if (result.recoveredOrders && result.recoveredOrders.length > 0) {
        toast({
          title: "Recovery Successful!",
          description: `Recovered ${result.recoveredOrders.length} subscription(s). Please refresh the page to see your active subscription.`,
        });
      } else {
        toast({
          title: "No Issues Found",
          description: "All subscription orders are already properly processed.",
        });
      }
    } catch (error) {
      console.error('Recovery error:', error);
      toast({
        title: "Recovery Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-amber-800">Subscription Recovery</CardTitle>
        <CardDescription className="text-amber-700">
          If you recently made a subscription purchase but don't see an active subscription, 
          try running this recovery tool to sync with Stripe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleRecovery}
          disabled={isRecovering}
          variant="outline"
          className="border-amber-300 text-amber-800 hover:bg-amber-100"
        >
          {isRecovering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Recover Missing Subscriptions
        </Button>
      </CardContent>
    </Card>
  );
}