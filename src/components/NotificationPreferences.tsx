import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, MessageSquare } from "lucide-react";

const NotificationPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_newsletter, sms_notifications')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setEmailNotifications(data.email_newsletter || false);
        setSmsNotifications(data.sms_notifications || false);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (field: 'email_newsletter' | 'sms_notifications', value: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: `${field === 'email_newsletter' ? 'Email' : 'SMS'} notifications ${value ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating notification preference:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
      
      // Revert the state on error
      if (field === 'email_newsletter') {
        setEmailNotifications(!value);
      } else {
        setSmsNotifications(!value);
      }
    }
  };

  const handleEmailToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    updatePreference('email_newsletter', checked);
  };

  const handleSmsToggle = (checked: boolean) => {
    setSmsNotifications(checked);
    updatePreference('sms_notifications', checked);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary" />
            <span>Notification Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-primary" />
          <span>Notification Preferences</span>
        </CardTitle>
        <CardDescription>
          Choose how you'd like to receive updates about your orders and deliveries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-sm font-medium">
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive updates about orders, deliveries, and newsletters
              </p>
            </div>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={handleEmailToggle}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications" className="text-sm font-medium">
                SMS Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Get text messages for delivery updates and important alerts
              </p>
            </div>
          </div>
          <Switch
            id="sms-notifications"
            checked={smsNotifications}
            onCheckedChange={handleSmsToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;