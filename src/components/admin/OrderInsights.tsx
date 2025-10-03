
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarDays, DollarSign, Users, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface OrderInsightsData {
  totalRevenue: number;
  totalOrders: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
  averageOrderValue: number;
  cancellationRate: number;
  monthlyRecurringRevenue: number;
  subscriptionRevenue: number;
  oneTimeRevenue: number;
  dailyOrders: Array<{ date: string; orders: number }>;
  revenueByBoxSize: Array<{ boxSize: string; revenue: number }>;
  subscriptionHealth: Array<{ status: string; count: number }>;
  monthlyGrowth: Array<{ month: string; revenue: number; orders: number }>;
  cancellationsByReason: Array<{ reason: string; count: number }>;
  revenueByType: Array<{ type: string; revenue: number }>;
  subscriptionTypeBreakdown: Array<{ type: string; count: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8'];

export const OrderInsights = () => {
  const [data, setData] = useState<OrderInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(30); // Last 30 days by default
  const { toast } = useToast();

  useEffect(() => {
    fetchInsightsData();
  }, [dateRange]);

  const fetchInsightsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Fetch orders data - now the primary source of truth
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            quantity,
            price,
            products(name)
          )
        `)
        .gte('order_date', startDate.toISOString())
        .lte('order_date', endDate.toISOString());

      if (ordersError) throw ordersError;

      // Fetch ALL subscriptions (not just active)
      const { data: allSubscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Fetch box sizes for MRR calculation
      const { data: boxSizes, error: boxSizesError } = await supabase
        .from('box_sizes')
        .select('*');

      if (boxSizesError) throw boxSizesError;

      // Calculate subscription counts by status
      const activeSubscriptions = allSubscriptions?.filter(s => s.status === 'active').length || 0;
      const pausedSubscriptions = allSubscriptions?.filter(s => s.status === 'paused').length || 0;
      const cancelledSubscriptions = allSubscriptions?.filter(s => s.status === 'cancelled').length || 0;
      const totalSubscriptions = allSubscriptions?.length || 0;

      // Calculate cancellation rate
      const cancellationRate = totalSubscriptions > 0 
        ? (cancelledSubscriptions / totalSubscriptions) * 100 
        : 0;

      // Calculate MRR (Monthly Recurring Revenue) from active subscriptions
      let monthlyRecurringRevenue = 0;
      const boxSizeMap = new Map(boxSizes?.map(bs => [bs.name, bs.subscriber_price || bs.base_price]) || []);
      
      allSubscriptions?.filter(s => s.status === 'active').forEach(sub => {
        // Parse the subscription type to determine box size and frequency
        const parts = sub.subscription_type?.split('_') || [];
        const boxName = parts[0]; // 'veggie', 'full', 'protein'
        
        // Map to actual box size names
        let actualBoxName = boxName;
        if (boxName === 'veggie') actualBoxName = 'veggie_bag';
        if (boxName === 'full') actualBoxName = 'full_farm_bag';
        if (boxName === 'protein') actualBoxName = 'protein-pack';
        
        const price = boxSizeMap.get(actualBoxName) || 0;
        monthlyRecurringRevenue += Number(price) + 9; // Add $9 delivery fee
      });

      // Calculate revenue split
      const subscriptionRevenue = (orders || [])
        .filter(o => o.order_type === 'subscription')
        .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
      
      const oneTimeRevenue = (orders || [])
        .filter(o => o.order_type === 'one-time')
        .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);

      // Calculate KPIs
      const totalRevenue = (orders || [])
        .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);

      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate daily orders
      const dailyOrdersMap = new Map();
      (orders || []).forEach(order => {
        const date = new Date(order.order_date).toISOString().split('T')[0];
        dailyOrdersMap.set(date, (dailyOrdersMap.get(date) || 0) + 1);
      });

      const dailyOrders = Array.from(dailyOrdersMap.entries())
        .map(([date, orders]) => ({ date, orders }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate revenue by box size from orders
      const revenueByBoxMap = new Map();
      (orders || []).forEach(order => {
        const boxSize = (order as any).box_size || 'Standard';
        revenueByBoxMap.set(boxSize, (revenueByBoxMap.get(boxSize) || 0) + (Number(order.total_amount) || 0));
      });

      const revenueByBoxSize = Array.from(revenueByBoxMap.entries())
        .map(([boxSize, revenue]) => ({ boxSize, revenue }));

      // Subscription health - all statuses
      const subscriptionHealth = [
        { status: 'Active', count: activeSubscriptions },
        { status: 'Paused', count: pausedSubscriptions },
        { status: 'Cancelled', count: cancelledSubscriptions }
      ].filter(item => item.count > 0);

      // Cancellations by reason
      const cancellationReasonMap = new Map();
      allSubscriptions?.filter(s => s.status === 'cancelled' && s.cancellation_reason).forEach(sub => {
        const reason = sub.cancellation_reason || 'No reason provided';
        cancellationReasonMap.set(reason, (cancellationReasonMap.get(reason) || 0) + 1);
      });

      const cancellationsByReason = Array.from(cancellationReasonMap.entries())
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count);

      // Revenue by type
      const revenueByType = [
        { type: 'Subscription', revenue: subscriptionRevenue },
        { type: 'One-Time', revenue: oneTimeRevenue }
      ].filter(item => item.revenue > 0);

      // Subscription type breakdown
      const subscriptionTypeMap = new Map();
      allSubscriptions?.filter(s => s.status === 'active').forEach(sub => {
        const type = sub.subscription_type || 'Unknown';
        subscriptionTypeMap.set(type, (subscriptionTypeMap.get(type) || 0) + 1);
      });

      const subscriptionTypeBreakdown = Array.from(subscriptionTypeMap.entries())
        .map(([type, count]) => ({ type, count }));

      // Monthly growth (last 6 months)
      const monthlyGrowthMap = new Map();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      (orders || []).forEach(order => {
        const orderDate = new Date(order.order_date);
        if (orderDate >= sixMonthsAgo) {
          const month = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          const existing = monthlyGrowthMap.get(month) || { revenue: 0, orders: 0 };
          monthlyGrowthMap.set(month, {
            revenue: existing.revenue + (Number(order.total_amount) || 0),
            orders: existing.orders + 1
          });
        }
      });

      const monthlyGrowth = Array.from(monthlyGrowthMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      setData({
        totalRevenue,
        totalOrders,
        activeSubscriptions,
        pausedSubscriptions,
        cancelledSubscriptions,
        averageOrderValue,
        cancellationRate,
        monthlyRecurringRevenue,
        subscriptionRevenue,
        oneTimeRevenue,
        dailyOrders,
        revenueByBoxSize,
        subscriptionHealth,
        monthlyGrowth,
        cancellationsByReason,
        revenueByType,
        subscriptionTypeBreakdown
      });

    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (!data && !loading) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Insights
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Insights Dashboard</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">Loading insights...</div>
        ) : data ? (
          <div className="space-y-6">
            {/* Date Range Selector */}
            <div className="flex gap-2">
              {[7, 30, 90, 365].map(days => (
                <Button
                  key={days}
                  variant={dateRange === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange(days)}
                >
                  {days === 365 ? '1 Year' : `${days} Days`}
                </Button>
              ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 min-h-[120px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 min-h-[120px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{data.totalOrders}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 min-h-[120px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm font-medium text-muted-foreground cursor-help">
                              MRR
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Monthly Recurring Revenue</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p className="text-2xl font-bold">{formatCurrency(data.monthlyRecurringRevenue)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 min-h-[120px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm font-medium text-muted-foreground cursor-help">
                              Active Subs
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Active Subscriptions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p className="text-2xl font-bold">{data.activeSubscriptions}</p>
                      {data.pausedSubscriptions > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {data.pausedSubscriptions} paused
                        </p>
                      )}
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 min-h-[120px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cancellation Rate</p>
                      <p className="text-2xl font-bold">{data.cancellationRate.toFixed(1)}%</p>
                      {data.cancelledSubscriptions > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {data.cancelledSubscriptions} cancelled
                        </p>
                      )}
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 min-h-[120px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm font-medium text-muted-foreground cursor-help">
                              AOV
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Average Order Value</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p className="text-2xl font-bold">{formatCurrency(data.averageOrderValue)}</p>
                    </div>
                    <CalendarDays className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Orders Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ orders: { label: 'Orders', color: 'hsl(var(--primary))' } }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data.dailyOrders}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Revenue by Box Size */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Box Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ revenue: { label: 'Revenue', color: 'hsl(var(--secondary))' } }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.revenueByBoxSize}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="boxSize" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="hsl(var(--secondary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Subscription Health */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.subscriptionHealth}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.subscriptionHealth.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ 
                    revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
                    orders: { label: 'Orders', color: 'hsl(var(--accent))' }
                  }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data.monthlyGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                        <Line type="monotone" dataKey="orders" stroke="hsl(var(--accent))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Cancellation Reasons */}
              {data.cancellationsByReason.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cancellation Reasons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{ count: { label: 'Count', color: 'hsl(var(--destructive))' } }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.cancellationsByReason} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="reason" type="category" width={150} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="hsl(var(--destructive))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Revenue by Order Type */}
              {data.revenueByType.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Order Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.revenueByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {data.revenueByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Subscription Type Breakdown */}
              {data.subscriptionTypeBreakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Active Subscription Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{ count: { label: 'Count', color: 'hsl(var(--chart-2))' } }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.subscriptionTypeBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
