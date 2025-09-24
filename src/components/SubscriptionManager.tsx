import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, X, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionManagerProps {
  subscription: {
    id: string;
    status: string;
    subscription_type: string;
    cancelled_at?: string | null;
  } | null;
  onSubscriptionUpdate: () => void;
  boxSize?: string | null;
}

export function SubscriptionManager({ subscription, onSubscriptionUpdate, boxSize }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCustomerPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to access customer portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToSubscription = async () => {
    setLoading(true);
    try {
      const payload = { box_size: (boxSize || 'medium').toLowerCase() } as { box_size: string };
      const { data, error } = await supabase.functions.invoke('create-checkout', { body: payload });
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');
      window.open(data.url, '_blank');
      toast({ title: 'Redirecting to Stripe', description: 'Complete checkout to start your subscription.' });
    } catch (error: any) {
      console.error('Error starting subscription:', error);
      toast({
        title: 'Error',
        description: error?.error?.message || error?.message || 'Failed to start subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      await onSubscriptionUpdate();
      toast({ title: 'Subscription status refreshed' });
    } catch (error) {
      console.error('Error refreshing status:', error);
      toast({ title: 'Error', description: 'Failed to refresh status.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Subscription Management
            </span>
            <Badge variant="outline">No subscription</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You currently don't have an active subscription. Upgrade your one-time purchase to receive a weekly box automatically.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleUpgradeToSubscription} size="sm" disabled={loading}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {loading ? 'Starting…' : 'Upgrade to subscription'}
            </Button>
            <Button onClick={handleRefreshStatus} size="sm" variant="outline" disabled={loading}>
              Refresh status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }


  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          reason: cancelReason || 'User requested cancellation'
        }
      });

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You can reactivate it anytime.",
      });

      onSubscriptionUpdate();
      setCancelReason("");
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{subscription.status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Subscription Management
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Type:</span>
            <p className="text-muted-foreground capitalize">{subscription.subscription_type}</p>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <p className="text-muted-foreground capitalize">{subscription.status}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          {subscription.status === 'active' && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel your subscription permanently. To start receiving boxes again, you'll need to create a new subscription.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div>
                    <Label htmlFor="cancel-reason">Reason (optional)</Label>
                    <Textarea
                      id="cancel-reason"
                      placeholder="Help us improve by telling us why you're cancelling..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription} disabled={loading}>
                      {loading ? 'Cancelling...' : 'Cancel Subscription'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={handleRefreshStatus} size="sm" variant="outline" disabled={loading}>
                Refresh status
              </Button>
            </>
          )}

          {subscription.status === 'cancelled' && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Your subscription has been cancelled. To start receiving boxes again, you'll need to create a new subscription.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleUpgradeToSubscription} size="sm" variant="default" disabled={loading}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Start New Subscription
                </Button>
                <Button onClick={handleRefreshStatus} size="sm" variant="outline" disabled={loading}>
                  Refresh status
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}