
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Users, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface OrderInsightsData {
  totalRevenue: number;
  totalOrders: number;
  activeSubscriptions: number;
  averageOrderValue: number;
  dailyOrders: Array<{ date: string; orders: number }>;
  revenueByBoxSize: Array<{ boxSize: string; revenue: number }>;
  subscriptionHealth: Array<{ status: string; count: number }>;
  monthlyGrowth: Array<{ month: string; revenue: number; orders: number }>;
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

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('order_date', startDate.toISOString())
        .lte('order_date', endDate.toISOString());

      if (ordersError) throw ordersError;

      // Fetch weekly bags data
      const { data: weeklyBags, error: bagsError } = await supabase
        .from('weekly_bags')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (bagsError) throw bagsError;

      // Fetch subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active');

      if (subsError) throw subsError;

      // Calculate KPIs
      const totalRevenue = [...(orders || []), ...(weeklyBags || [])]
        .reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);

      const totalOrders = (orders?.length || 0) + (weeklyBags?.length || 0);
      const activeSubscriptions = subscriptions?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate daily orders
      const dailyOrdersMap = new Map();
      [...(orders || []), ...(weeklyBags || [])].forEach(order => {
        const date = new Date('order_date' in order ? order.order_date : order.created_at).toISOString().split('T')[0];
        dailyOrdersMap.set(date, (dailyOrdersMap.get(date) || 0) + 1);
      });

      const dailyOrders = Array.from(dailyOrdersMap.entries())
        .map(([date, orders]) => ({ date, orders }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate revenue by box size
      const revenueByBoxMap = new Map();
      weeklyBags?.forEach(bag => {
        const boxSize = bag.box_size || 'Unknown';
        revenueByBoxMap.set(boxSize, (revenueByBoxMap.get(boxSize) || 0) + (Number(bag.total_amount) || 0));
      });

      const revenueByBoxSize = Array.from(revenueByBoxMap.entries())
        .map(([boxSize, revenue]) => ({ boxSize, revenue }));

      // Subscription health
      const subscriptionHealthMap = new Map();
      subscriptions?.forEach(sub => {
        const status = sub.status;
        subscriptionHealthMap.set(status, (subscriptionHealthMap.get(status) || 0) + 1);
      });

      const subscriptionHealth = Array.from(subscriptionHealthMap.entries())
        .map(([status, count]) => ({ status, count }));

      // Monthly growth (last 6 months)
      const monthlyGrowthMap = new Map();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      [...(orders || []), ...(weeklyBags || [])].forEach(order => {
        const orderDate = new Date('order_date' in order ? order.order_date : order.created_at);
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
        averageOrderValue,
        dailyOrders,
        revenueByBoxSize,
        subscriptionHealth,
        monthlyGrowth
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
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
                <CardContent className="p-6">
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
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                      <p className="text-2xl font-bold">{data.activeSubscriptions}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(data.averageOrderValue)}</p>
                    </div>
                    <CalendarDays className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
