import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
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

type DeliveryDaySetting = {
  id: string;
  day_name: string;
  display_name: string;
  is_available: boolean;
  updated_at: string;
};

export const AdminDeliveryDays = () => {
  const [deliveryDays, setDeliveryDays] = useState<DeliveryDaySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; dayId: string; dayName: string; currentState: boolean } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliveryDays();
  }, []);

  const fetchDeliveryDays = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_day_settings')
        .select('*')
        .order('day_name');

      if (error) throw error;
      setDeliveryDays(data || []);
    } catch (error) {
      console.error('Error fetching delivery days:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery day settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (day: DeliveryDaySetting) => {
    // If turning off, show confirmation dialog
    if (day.is_available) {
      setConfirmDialog({
        open: true,
        dayId: day.id,
        dayName: day.display_name,
        currentState: day.is_available,
      });
    } else {
      // If turning on, no confirmation needed
      updateDeliveryDay(day.id, true);
    }
  };

  const updateDeliveryDay = async (dayId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('delivery_day_settings')
        .update({ 
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dayId);

      if (error) throw error;

      // Update local state
      setDeliveryDays(prev => 
        prev.map(day => 
          day.id === dayId 
            ? { ...day, is_available: isAvailable, updated_at: new Date().toISOString() }
            : day
        )
      );

      toast({
        title: "Success",
        description: `Delivery day ${isAvailable ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error updating delivery day:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery day",
        variant: "destructive",
      });
    }
  };

  const handleConfirmToggle = () => {
    if (confirmDialog) {
      updateDeliveryDay(confirmDialog.dayId, !confirmDialog.currentState);
      setConfirmDialog(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <p className="text-muted-foreground">Loading delivery days...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-4">
        {deliveryDays.map((day) => (
          <Card key={day.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{day.display_name}</CardTitle>
                <Switch
                  checked={day.is_available}
                  onCheckedChange={() => handleToggle(day)}
                />
              </div>
              <CardDescription>
                {day.is_available ? 'Available for delivery' : 'Not available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {day.is_available ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <Badge variant="destructive">
                      Disabled
                    </Badge>
                  </>
                )}
              </div>
              {day.day_name === 'saturday' && day.is_available && (
                <Badge variant="secondary" className="mt-2">
                  Most Popular
                </Badge>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Last updated: {new Date(day.updated_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Toggle days on/off to control which delivery days customers can select</li>
            <li>• When a day is disabled, it will appear crossed out and non-clickable for customers</li>
            <li>• Changes take effect immediately for all new orders</li>
            <li>• Existing orders are not affected by these changes</li>
            <li>• Use this feature when deliveries cannot be made on certain days</li>
          </ul>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.open || false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable {confirmDialog?.dayName} Delivery?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent customers from selecting {confirmDialog?.dayName} as their delivery day.
              The day will appear crossed out and non-clickable on the delivery page.
              This change takes effect immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggle}>
              Disable Day
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
