import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Pause, Play, X, CalendarDays, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionManagerProps {
  subscription: {
    id: string;
    status: string;
    subscription_type: string;
    paused_at?: string | null;
    cancelled_at?: string | null;
    auto_resume_date?: string | null;
  } | null;
  onSubscriptionUpdate: () => void;
}

export function SubscriptionManager({ subscription, onSubscriptionUpdate }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [resumeDate, setResumeDate] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!subscription) {
    return null;
  }

  const handlePauseSubscription = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        status: 'paused',
        paused_at: new Date().toISOString(),
        pause_reason: pauseReason || 'User requested pause'
      };

      if (resumeDate) {
        updateData.auto_resume_date = resumeDate;
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('id', subscription.id);

      if (error) throw error;

      toast({
        title: "Subscription Paused",
        description: "Your subscription has been paused successfully.",
      });

      onSubscriptionUpdate();
      setPauseReason("");
      setResumeDate("");
    } catch (error) {
      console.error('Error pausing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to pause subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          paused_at: null,
          pause_reason: null,
          auto_resume_date: null
        })
        .eq('id', subscription.id);

      if (error) throw error;

      toast({
        title: "Subscription Resumed",
        description: "Your subscription is now active again.",
      });

      onSubscriptionUpdate();
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast({
        title: "Error",
        description: "Failed to resume subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancelReason || 'User requested cancellation'
        })
        .eq('id', subscription.id);

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
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
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
          {subscription.paused_at && (
            <div>
              <span className="font-medium">Paused on:</span>
              <p className="text-muted-foreground">{formatDate(subscription.paused_at)}</p>
            </div>
          )}
          {subscription.auto_resume_date && (
            <div>
              <span className="font-medium">Auto-resume:</span>
              <p className="text-muted-foreground">{formatDate(subscription.auto_resume_date)}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          {subscription.status === 'active' && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Pause Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your subscription will be paused and you won't receive any deliveries until you resume it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pause-reason">Reason (optional)</Label>
                      <Textarea
                        id="pause-reason"
                        placeholder="Let us know why you're pausing..."
                        value={pauseReason}
                        onChange={(e) => setPauseReason(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="resume-date">Auto-resume date (optional)</Label>
                      <input
                        type="date"
                        id="resume-date"
                        className="w-full p-2 border rounded-md"
                        value={resumeDate}
                        onChange={(e) => setResumeDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePauseSubscription} disabled={loading}>
                      {loading ? 'Pausing...' : 'Pause Subscription'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

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
                      This will cancel your subscription. You can reactivate it later if you change your mind.
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
            </>
          )}

          {subscription.status === 'paused' && (
            <Button onClick={handleResumeSubscription} disabled={loading} size="sm">
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Resuming...' : 'Resume Subscription'}
            </Button>
          )}

          {subscription.status === 'cancelled' && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                To change your subscription, you'll need to start a new one.
              </p>
              <Button onClick={() => navigate('/')} size="sm" variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Start New Subscription
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}