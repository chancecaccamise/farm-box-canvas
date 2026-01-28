import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, CheckCircle, PauseCircle } from 'lucide-react';
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

interface SiteSettings {
  id: string;
  checkout_paused: boolean;
  checkout_paused_message: string;
  updated_at: string;
}

export const CheckoutStatusCard = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      toast({
        title: "Error",
        description: "Failed to load checkout status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!settings) return;
    
    if (!settings.checkout_paused) {
      // Pausing checkout - show confirmation
      setShowConfirmDialog(true);
    } else {
      // Resuming checkout - no confirmation needed
      updateCheckoutStatus(false);
    }
  };

  const updateCheckoutStatus = async (paused: boolean) => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ 
          checkout_paused: paused,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, checkout_paused: paused } : null);

      toast({
        title: paused ? "Checkout Paused" : "Checkout Resumed",
        description: paused 
          ? "Customers can no longer start new orders"
          : "Customers can now place orders again",
      });
    } catch (error) {
      console.error('Error updating checkout status:', error);
      toast({
        title: "Error",
        description: "Failed to update checkout status",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPause = () => {
    updateCheckoutStatus(true);
    setShowConfirmDialog(false);
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <>
      <Card className={`mb-6 ${settings.checkout_paused ? 'border-amber-300 bg-amber-50/50' : 'border-green-300 bg-green-50/50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5" />
              Checkout Status
            </CardTitle>
            {settings.checkout_paused ? (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                <PauseCircle className="w-3 h-3 mr-1" />
                Paused
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Switch
                  checked={settings.checkout_paused}
                  onCheckedChange={handleToggle}
                />
                <span className="font-medium">
                  {settings.checkout_paused ? 'Checkout is paused' : 'Pause All Checkouts'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                {settings.checkout_paused 
                  ? 'Customers cannot start new orders or purchase add-ons. Existing subscriptions continue to bill normally.'
                  : 'When paused, customers see a friendly message and cannot complete new purchases.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause All Checkouts?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will prevent all customers from:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Starting new subscriptions</li>
                <li>Making one-time purchases</li>
                <li>Purchasing add-ons</li>
              </ul>
              <p className="pt-2 font-medium">
                Existing subscriptions will continue to bill normally via Stripe.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPause} className="bg-amber-600 hover:bg-amber-700">
              Pause Checkout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
