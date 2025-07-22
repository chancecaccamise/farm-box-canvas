import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderWithDetails {
  id: string;
  user_id: string;
  order_date: string;
  delivery_date: string | null;
  total_amount: number;
  status: string;
  order_type: string;
  order_items: {
    quantity: number;
    price: number;
    products: {
      name: string;
    };
  }[];
}

export const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

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
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

  const exportOrders = async () => {
    try {
      const filteredOrders = getFilteredOrders();
      
      // Create CSV content
      const headers = [
        'Order ID',
        'Customer Name',
        'Order Date',
        'Delivery Date',
        'Status',
        'Order Type',
        'Total Amount',
        'Items'
      ];

      const csvContent = [
        headers.join(','),
        ...filteredOrders.map(order => [
          order.id,
          `"${getCustomerName(order)}"`,
          new Date(order.order_date).toLocaleDateString(),
          order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not scheduled',
          order.status,
          order.order_type,
          `$${order.total_amount}`,
          `"${order.order_items.map(item => `${item.quantity}x ${item.products.name}`).join('; ')}"`,
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Orders exported successfully"
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

  const getCustomerName = (order: OrderWithDetails) => {
    return `Customer ${order.user_id.slice(0, 8)}`;
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = getCustomerName(order).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesDate = !dateFilter || order.order_date.startsWith(dateFilter);
      
      return matchesSearch && matchesStatus && matchesDate;
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
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <Button onClick={exportOrders}>
          <Download className="h-4 w-4 mr-2" />
          Export Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="search">Search Orders</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              placeholder="Customer name or order ID..."
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">Date Filter</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-end">
          <div className="text-sm text-muted-foreground">
            Total: {filteredOrders.length} orders
            <br />
            Value: ${filteredOrders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                  <p className="text-muted-foreground">Customer: {getCustomerName(order)}</p>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.order_type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Order Date</Label>
                  <p className="text-sm">{new Date(order.order_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Delivery Date</Label>
                  <p className="text-sm">
                    {order.delivery_date 
                      ? new Date(order.delivery_date).toLocaleDateString()
                      : 'Not scheduled'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <p className="text-sm font-semibold">${order.total_amount}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Order Items</Label>
                <div className="mt-2 space-y-1">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.products.name}</span>
                      <span>${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No orders found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};