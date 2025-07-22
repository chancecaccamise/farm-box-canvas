import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, Calendar, Truck, MapPin, Package, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderInsights } from './OrderInsights';

interface EnhancedOrder {
  id: string;
  user_id: string;
  order_date: string;
  delivery_date: string | null;
  total_amount: number;
  status: string;
  order_type: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address_street: string | null;
  shipping_address_apartment: string | null;
  shipping_address_city: string | null;
  shipping_address_state: string | null;
  shipping_address_zip: string | null;
  delivery_instructions: string | null;
  box_size: string | null;
  box_price: number | null;
  addons_total: number | null;
  delivery_fee: number | null;
  route_batch_id: string | null;
  assigned_driver_id: string | null;
  delivery_sequence: number | null;
  payment_status: string | null;
  order_items: {
    quantity: number;
    price: number;
    product_name: string | null;
    item_type: string;
    products: {
      name: string;
    } | null;
  }[];
}

interface DeliveryDay {
  date: string;
  orders: EnhancedOrder[];
  totalValue: number;
  routeOptimized: boolean;
}

export const EnhancedOrderManagement = () => {
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [deliveryDays, setDeliveryDays] = useState<DeliveryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDeliveryDay, setSelectedDeliveryDay] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    const orderSubscription = supabase
      .channel('orders-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order change:', payload);
          fetchOrders(); // Refresh data on any change
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        (payload) => {
          console.log('Order items change:', payload);
          fetchOrders(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, []);

  useEffect(() => {
    processDeliveryDays();
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            quantity,
            price,
            products(name)
          )
        `)
        .order('delivery_date', { ascending: true });

      if (error) throw error;
      
      // Transform data to match EnhancedOrder interface, setting defaults for new fields
      const enhancedOrders: EnhancedOrder[] = (data || []).map(order => ({
        ...order,
        customer_name: (order as any).customer_name || null,
        customer_email: (order as any).customer_email || null,
        customer_phone: (order as any).customer_phone || null,
        shipping_address_street: (order as any).shipping_address_street || null,
        shipping_address_apartment: (order as any).shipping_address_apartment || null,
        shipping_address_city: (order as any).shipping_address_city || null,
        shipping_address_state: (order as any).shipping_address_state || null,
        shipping_address_zip: (order as any).shipping_address_zip || null,
        delivery_instructions: (order as any).delivery_instructions || null,
        box_size: (order as any).box_size || null,
        box_price: (order as any).box_price || null,
        addons_total: (order as any).addons_total || null,
        delivery_fee: (order as any).delivery_fee || null,
        route_batch_id: (order as any).route_batch_id || null,
        assigned_driver_id: (order as any).assigned_driver_id || null,
        delivery_sequence: (order as any).delivery_sequence || null,
        payment_status: (order as any).payment_status || null,
        order_items: order.order_items.map(item => ({
          ...item,
          product_name: (item as any).product_name || null,
          item_type: (item as any).item_type || 'addon'
        }))
      }));
      
      setOrders(enhancedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processDeliveryDays = () => {
    const dayMap = new Map<string, EnhancedOrder[]>();
    
    orders.forEach(order => {
      if (order.delivery_date) {
        const deliveryDate = new Date(order.delivery_date).toISOString().split('T')[0];
        if (!dayMap.has(deliveryDate)) {
          dayMap.set(deliveryDate, []);
        }
        dayMap.get(deliveryDate)!.push(order);
      }
    });

    const days: DeliveryDay[] = Array.from(dayMap.entries()).map(([date, dayOrders]) => ({
      date,
      orders: dayOrders.sort((a, b) => (a.delivery_sequence || 999) - (b.delivery_sequence || 999)),
      totalValue: dayOrders.reduce((sum, order) => sum + order.total_amount, 0),
      routeOptimized: dayOrders.some(order => order.route_batch_id !== null)
    }));

    days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setDeliveryDays(days);
  };

  const exportDeliveryData = async (deliveryDate?: string) => {
    try {
      const ordersToExport = deliveryDate 
        ? orders.filter(order => order.delivery_date && 
            new Date(order.delivery_date).toISOString().split('T')[0] === deliveryDate)
        : getFilteredOrders();
      
      // Enhanced CSV with delivery route information
      const headers = [
        'Order ID',
        'Customer Name',
        'Customer Email', 
        'Customer Phone',
        'Delivery Address',
        'Apartment/Unit',
        'City',
        'State',
        'ZIP',
        'Delivery Instructions',
        'Order Date',
        'Delivery Date',
        'Delivery Sequence',
        'Status',
        'Payment Status',
        'Box Size',
        'Box Price',
        'Addons Total',
        'Delivery Fee',
        'Total Amount',
        'Route Batch ID',
        'Assigned Driver',
        'Items Summary'
      ];

      const csvContent = [
        headers.join(','),
        ...ordersToExport.map(order => [
          order.id,
          `"${order.customer_name || getCustomerName(order)}"`,
          `"${order.customer_email || ''}"`,
          `"${order.customer_phone || ''}"`,
          `"${order.shipping_address_street || ''}"`,
          `"${order.shipping_address_apartment || ''}"`,
          `"${order.shipping_address_city || ''}"`,
          `"${order.shipping_address_state || ''}"`,
          `"${order.shipping_address_zip || ''}"`,
          `"${order.delivery_instructions || ''}"`,
          new Date(order.order_date).toLocaleDateString(),
          order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not scheduled',
          order.delivery_sequence || '',
          order.status,
          order.payment_status || 'unknown',
          order.box_size || '',
          order.box_price || 0,
          order.addons_total || 0,
          order.delivery_fee || 0,
          order.total_amount,
          order.route_batch_id || '',
          order.assigned_driver_id || '',
          `"${order.order_items.map(item => 
            `${item.quantity}x ${item.product_name || item.products?.name || 'Unknown'}`
          ).join('; ')}"`,
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = deliveryDate 
        ? `delivery-${deliveryDate}-orders.csv`
        : `all-orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Orders exported successfully: ${fileName}`
      });
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast({
        title: "Error",
        description: "Failed to export orders",
        variant: "destructive"
      });
    }
  };

  const getCustomerName = (order: EnhancedOrder) => {
    return order.customer_name || `Customer ${order.user_id.slice(0, 8)}`;
  };

  const getFullAddress = (order: EnhancedOrder) => {
    const parts = [
      order.shipping_address_street,
      order.shipping_address_apartment,
      order.shipping_address_city,
      order.shipping_address_state,
      order.shipping_address_zip
    ].filter(Boolean);
    return parts.join(', ') || 'Address not provided';
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = 
        getCustomerName(order).toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      const matchesDeliveryDay = selectedDeliveryDay === 'all' || 
        (order.delivery_date && new Date(order.delivery_date).toISOString().split('T')[0] === selectedDeliveryDay);
      
      return matchesSearch && matchesStatus && matchesDeliveryDay;
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'confirmed':
        return 'default';
      case 'out_for_delivery':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading order management...</div>;
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="space-y-6">
      {/* Header with insights and main export */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Enhanced Order Management</h2>
        <div className="flex gap-2">
          <OrderInsights />
          <Button onClick={() => exportDeliveryData()}>
            <Download className="h-4 w-4 mr-2" />
            Export All Orders
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Delivery Days</p>
                <p className="text-2xl font-bold">{deliveryDays.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Route Optimized</p>
                <p className="text-2xl font-bold">{deliveryDays.filter(d => d.routeOptimized).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ${orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="by-delivery-day" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-delivery-day">By Delivery Day</TabsTrigger>
          <TabsTrigger value="all-orders">All Orders Table</TabsTrigger>
        </TabsList>

        <TabsContent value="by-delivery-day" className="space-y-6">
          {deliveryDays.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No scheduled deliveries found.</p>
              </CardContent>
            </Card>
          ) : (
            deliveryDays.map((day) => (
              <Card key={day.date}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        {day.routeOptimized && (
                          <Badge variant="default" className="ml-2">
                            <Truck className="h-3 w-3 mr-1" />
                            Route Optimized
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {day.orders.length} orders • ${day.totalValue.toFixed(2)} total value
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportDeliveryData(day.date)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Day
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seq</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {day.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.delivery_sequence || '-'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{getCustomerName(order)}</p>
                              {order.customer_email && (
                                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                              )}
                              {order.customer_phone && (
                                <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm">{getFullAddress(order)}</p>
                              {order.delivery_instructions && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Note: {order.delivery_instructions}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {order.box_size && (
                                <p className="font-medium">{order.box_size} box</p>
                              )}
                              {order.order_items.map((item, idx) => (
                                <p key={idx} className="text-muted-foreground">
                                  {item.quantity}x {item.product_name || item.products?.name || 'Unknown'}
                                </p>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${order.total_amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                            >
                              {order.payment_status || 'unknown'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all-orders" className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Customer, email, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="delivery-day">Delivery Day</Label>
              <Select value={selectedDeliveryDay} onValueChange={setSelectedDeliveryDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {deliveryDays.map((day) => (
                    <SelectItem key={day.date} value={day.date}>
                      {new Date(day.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                Showing: {filteredOrders.length} orders
                <br />
                Value: ${filteredOrders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.order_date).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getCustomerName(order)}</p>
                          {order.customer_email && (
                            <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {order.delivery_date 
                              ? new Date(order.delivery_date).toLocaleDateString()
                              : 'Not scheduled'
                            }
                          </p>
                          {order.delivery_sequence && (
                            <p className="text-xs text-muted-foreground">Seq: {order.delivery_sequence}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{getFullAddress(order)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${order.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                        >
                          {order.payment_status || 'unknown'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No orders found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};