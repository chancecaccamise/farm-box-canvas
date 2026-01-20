import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, UserCheck, RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SubscriberWithMissingOrder {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  subscription_type: string;
  subscription_status: string;
  subscription_created_at: string;
  stripe_subscription_id: string | null;
  has_delivery_address: boolean;
  has_weekly_bag: boolean;
  weekly_bag_id: string | null;
  box_size: string | null;
  weeks_without_order: number;
}

export const AdminSubscriberOrderRecovery = () => {
  const [subscribers, setSubscribers] = useState<SubscriberWithMissingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribersWithMissingOrders();
  }, []);

  const fetchSubscribersWithMissingOrders = async () => {
    try {
      setLoading(true);

      // Get current week start (Monday)
      const now = new Date();
      const dayOfWeek = now.getUTCDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const currentWeekStart = new Date(now);
      currentWeekStart.setUTCDate(now.getUTCDate() - daysFromMonday);
      currentWeekStart.setUTCHours(0, 0, 0, 0);
      const currentWeekStartStr = currentWeekStart.toISOString().split('T')[0];

      // Get all active subscriptions
      const { data: activeSubscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active');

      if (subError) throw subError;

      const subscribersWithIssues: SubscriberWithMissingOrder[] = [];

      for (const subscription of activeSubscriptions || []) {
        // Check if they have an order for current week
        const { data: currentWeekOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', subscription.user_id)
          .eq('week_start_date', currentWeekStartStr)
          .maybeSingle();

        // If they have an order for this week, skip
        if (currentWeekOrder) continue;

        // Get user profile and email
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', subscription.user_id)
          .maybeSingle();

        // Get user email from admin function
        const { data: adminUsers } = await supabase
          .rpc('get_admin_user_list');
        
        const userInfo = adminUsers?.find(u => u.user_id === subscription.user_id);

        // Check if they have a delivery address
        const { data: deliveryAddress } = await supabase
          .from('delivery_addresses')
          .select('id')
          .eq('user_id', subscription.user_id)
          .eq('is_primary', true)
          .maybeSingle();

        // Check if they have a weekly bag for current week
        const { data: weeklyBag } = await supabase
          .from('weekly_bags')
          .select('id, box_size')
          .eq('user_id', subscription.user_id)
          .eq('week_start_date', currentWeekStartStr)
          .maybeSingle();

        // Count how many weeks they've been active without orders
        const subscriptionCreatedAt = new Date(subscription.created_at);
        const weeksSinceCreation = Math.floor(
          (now.getTime() - subscriptionCreatedAt.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );

        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', subscription.user_id);

        const weeksWithoutOrder = Math.max(0, weeksSinceCreation - (orderCount || 0));

        subscribersWithIssues.push({
          user_id: subscription.user_id,
          email: userInfo?.email || 'Unknown',
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          subscription_type: subscription.subscription_type,
          subscription_status: subscription.status,
          subscription_created_at: subscription.created_at,
          stripe_subscription_id: subscription.stripe_subscription_id,
          has_delivery_address: !!deliveryAddress,
          has_weekly_bag: !!weeklyBag,
          weekly_bag_id: weeklyBag?.id || null,
          box_size: weeklyBag?.box_size || subscription.subscription_type,
          weeks_without_order: weeksWithoutOrder,
        });
      }

      setSubscribers(subscribersWithIssues);
    } catch (error) {
      console.error('Error fetching subscribers with missing orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscribers with missing orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrderForSubscriber = async (subscriber: SubscriberWithMissingOrder) => {
    try {
      setCreatingOrder(subscriber.user_id);

      const response = await supabase.functions.invoke('admin-create-subscriber-order', {
        body: { user_id: subscriber.user_id },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: 'Order Created',
        description: `Successfully created order for ${subscriber.first_name || subscriber.email}`,
      });

      // Refresh the list
      await fetchSubscribersWithMissingOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setCreatingOrder(null);
    }
  };

  const createAllMissingOrders = async () => {
    const eligibleSubscribers = subscribers.filter(s => s.has_delivery_address);
    
    for (const subscriber of eligibleSubscribers) {
      await createOrderForSubscriber(subscriber);
    }
  };

  const getDisplayName = (subscriber: SubscriberWithMissingOrder): string => {
    if (subscriber.first_name && subscriber.last_name) {
      return `${subscriber.first_name} ${subscriber.last_name}`;
    }
    if (subscriber.first_name) return subscriber.first_name;
    return subscriber.email;
  };

  const getBoxTypeDisplay = (boxType: string | null): string => {
    if (!boxType) return 'Unknown';
    const displayNames: Record<string, string> = {
      'small': 'Small Farm Box',
      'medium': 'Medium Farm Box',
      'large': 'Large Farm Box',
      'veggie-bag': 'Veggie Bag',
      'full_farm_bag': 'Full Farm Bag',
      'protein-pack': 'Protein Pack',
    };
    return displayNames[boxType] || boxType;
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Checking for subscribers without orders...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subscribers.length === 0) {
    return null; // Don't show anything if there are no issues
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <Card className="border-amber-200 bg-amber-50/50">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-amber-50/80 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <CardTitle className="text-lg text-amber-800">
                    Subscribers Missing Orders
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    {subscribers.length} active subscriber{subscribers.length !== 1 ? 's' : ''} without an order for this week
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                {subscribers.length} Issue{subscribers.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                These subscribers have active paid subscriptions but no order was generated for them.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSubscribersWithMissingOrders}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                {subscribers.filter(s => s.has_delivery_address).length > 1 && (
                  <Button
                    size="sm"
                    onClick={createAllMissingOrders}
                    disabled={creatingOrder !== null}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create All Orders
                  </Button>
                )}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Box Type</TableHead>
                  <TableHead>Subscription Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.user_id}>
                    <TableCell className="font-medium">
                      {getDisplayName(subscriber)}
                    </TableCell>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>{getBoxTypeDisplay(subscriber.box_size)}</TableCell>
                    <TableCell>
                      {new Date(subscriber.subscription_created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {!subscriber.has_delivery_address && (
                          <Badge variant="destructive" className="text-xs">
                            No Address
                          </Badge>
                        )}
                        {!subscriber.has_weekly_bag && (
                          <Badge variant="outline" className="text-xs">
                            No Weekly Bag
                          </Badge>
                        )}
                        {subscriber.has_delivery_address && subscriber.has_weekly_bag && (
                          <Badge variant="secondary" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        )}
                        {subscriber.weeks_without_order > 0 && (
                          <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                            {subscriber.weeks_without_order} week{subscriber.weeks_without_order !== 1 ? 's' : ''} missed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => createOrderForSubscriber(subscriber)}
                        disabled={!subscriber.has_delivery_address || creatingOrder === subscriber.user_id}
                      >
                        {creatingOrder === subscriber.user_id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Order
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
