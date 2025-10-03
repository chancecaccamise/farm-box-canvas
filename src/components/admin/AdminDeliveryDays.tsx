import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Home, Store, Warehouse, CheckCircle, XCircle } from 'lucide-react';
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

type DeliveryMethodSetting = {
  id: string;
  delivery_method: string;
  day_name: string;
  display_name: string;
  is_available: boolean;
  updated_at: string;
};

type MethodConfig = {
  key: string;
  display: string;
  icon: React.ReactNode;
  description: string;
};

const DELIVERY_METHODS: MethodConfig[] = [
  {
    key: 'delivery',
    display: 'Home Delivery',
    icon: <Home className="w-5 h-5" />,
    description: 'Direct to doorstep'
  },
  {
    key: 'market-pickup',
    display: 'Market Pickup',
    icon: <Store className="w-5 h-5" />,
    description: 'Pick up at farmers market'
  },
  {
    key: 'farm-pickup',
    display: 'Farm Pickup',
    icon: <Warehouse className="w-5 h-5" />,
    description: 'Pick up at the farm'
  }
];

const DAYS = ['thursday', 'saturday', 'sunday'];

export const AdminDeliveryDays = () => {
  const [settings, setSettings] = useState<DeliveryMethodSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ 
    open: boolean; 
    settingId: string; 
    methodDisplay: string;
    dayDisplay: string;
    currentState: boolean;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_method_settings')
        .select('*')
        .order('delivery_method')
        .order('day_name');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching delivery method settings:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery method settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (methodKey: string, dayName: string) => {
    return settings.find(s => s.delivery_method === methodKey && s.day_name === dayName);
  };

  const handleToggle = (setting: DeliveryMethodSetting, methodDisplay: string) => {
    if (setting.is_available) {
      setConfirmDialog({
        open: true,
        settingId: setting.id,
        methodDisplay,
        dayDisplay: setting.display_name,
        currentState: setting.is_available,
      });
    } else {
      updateSetting(setting.id, true);
    }
  };

  const updateSetting = async (settingId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('delivery_method_settings')
        .update({ 
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settingId);

      if (error) throw error;

      setSettings(prev => 
        prev.map(s => 
          s.id === settingId 
            ? { ...s, is_available: isAvailable, updated_at: new Date().toISOString() }
            : s
        )
      );

      toast({
        title: "Success",
        description: `Availability ${isAvailable ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const handleConfirmToggle = () => {
    if (confirmDialog) {
      updateSetting(confirmDialog.settingId, !confirmDialog.currentState);
      setConfirmDialog(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Home className="w-8 h-8 text-white" />
        </div>
        <p className="text-muted-foreground">Loading delivery settings...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Method & Day Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Control which days are available for each delivery method independently
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Method</th>
                  {DAYS.map(day => (
                    <th key={day} className="text-center p-4 font-semibold capitalize">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DELIVERY_METHODS.map(method => (
                  <tr key={method.key} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">{method.icon}</div>
                        <div>
                          <div className="font-medium">{method.display}</div>
                          <div className="text-xs text-muted-foreground">{method.description}</div>
                        </div>
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const setting = getSetting(method.key, day);
                      if (!setting) return <td key={day} className="p-4 text-center">-</td>;
                      
                      return (
                        <td key={day} className="p-4">
                          <div className="flex flex-col items-center gap-2">
                            <Switch
                              checked={setting.is_available}
                              onCheckedChange={() => handleToggle(setting, method.display)}
                            />
                            {setting.is_available ? (
                              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                Off
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Each delivery method can have different available days</li>
            <li>• Customers only see days available for their chosen fulfillment method</li>
            <li>• Unavailable days appear crossed out and non-clickable</li>
            <li>• Changes take effect immediately for all customers</li>
            <li>• Toggle days independently for Home Delivery, Market Pickup, and Farm Pickup</li>
          </ul>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialog?.open || false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Disable {confirmDialog?.dayDisplay} for {confirmDialog?.methodDisplay}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent customers from selecting {confirmDialog?.dayDisplay} when choosing {confirmDialog?.methodDisplay}.
              The day will appear crossed out and non-clickable for this method only.
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
