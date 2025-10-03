import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, Package, Users } from 'lucide-react';
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
  // New enhanced fields
  delivery_day_preference: string | null;
  delivery_time_preference: string | null;
  customer_notes: string | null;
  user_protein_selections: string[] | null;
  user_carb_selections: string[] | null;
  user_full_farm_bag_protein: string | null;
  user_full_farm_bag_carb: string | null;
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

export const EnhancedOrderManagement = () => {
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productNames, setProductNames] = useState<Record<string, string>>({});
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

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            quantity,
            price,
            product_name,
            item_type,
            products(name)
          )
        `)
        .order('order_date', { ascending: false });

      if (error) throw error;
      
      // Transform data to match EnhancedOrder interface
      const enhancedOrders: EnhancedOrder[] = (data || []).map(order => ({
        ...order,
        delivery_day_preference: (order as any).delivery_day_preference || null,
        delivery_time_preference: (order as any).delivery_time_preference || null,
        customer_notes: (order as any).customer_notes || null,
        user_protein_selections: (order as any).user_protein_selections || null,
        user_carb_selections: (order as any).user_carb_selections || null,
        user_full_farm_bag_protein: (order as any).user_full_farm_bag_protein || null,
        user_full_farm_bag_carb: (order as any).user_full_farm_bag_carb || null,
        route_batch_id: (order as any).route_batch_id || null,
        assigned_driver_id: (order as any).assigned_driver_id || null,
        delivery_sequence: (order as any).delivery_sequence || null,
        order_items: order.order_items.map(item => ({
          ...item,
          product_name: (item as any).product_name || null,
          item_type: (item as any).item_type || 'addon'
        }))
      }));
      
      setOrders(enhancedOrders);
      
      // Fetch all product names for selections
      const productIds = new Set<string>();
      enhancedOrders.forEach(order => {
        if (order.user_full_farm_bag_protein) productIds.add(order.user_full_farm_bag_protein);
        if (order.user_full_farm_bag_carb) productIds.add(order.user_full_farm_bag_carb);
        order.user_protein_selections?.forEach(id => productIds.add(id));
        order.user_carb_selections?.forEach(id => productIds.add(id));
      });
      
      if (productIds.size > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name')
          .in('id', Array.from(productIds));
        
        const nameMap: Record<string, string> = {};
        products?.forEach(product => nameMap[product.id] = product.name);
        setProductNames(nameMap);
      }
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

  const getDisplayName = (boxSize: string | null): string => {
    if (!boxSize) return 'Unknown';
    
    const displayNames = {
      'small': 'Small Farm Box',
      'medium': 'Medium Farm Box', 
      'large': 'Large Farm Box',
      'veggie_bag': 'Veggie Bag',
      'full_farm_bag': 'Full Farm Bag',
      'protein-pack': 'Protein Pack'
    };
    
    return displayNames[boxSize as keyof typeof displayNames] || boxSize;
  };

  const getCustomerSelections = (order: EnhancedOrder): string => {
    const selections = [];
    
    if (order.user_full_farm_bag_protein) {
      const proteinName = productNames[order.user_full_farm_bag_protein] || order.user_full_farm_bag_protein;
      selections.push(`Protein: ${proteinName}`);
    }
    
    if (order.user_full_farm_bag_carb) {
      const carbName = productNames[order.user_full_farm_bag_carb] || order.user_full_farm_bag_carb;
      selections.push(`Carb: ${carbName}`);
    }
    
    if (order.user_protein_selections && order.user_protein_selections.length > 0) {
      const proteinNames = order.user_protein_selections.map(id => productNames[id] || id);
      selections.push(`Proteins: ${proteinNames.join(', ')}`);
    }
    
    if (order.user_carb_selections && order.user_carb_selections.length > 0) {
      const carbNames = order.user_carb_selections.map(id => productNames[id] || id);
      selections.push(`Carbs: ${carbNames.join(', ')}`);
    }

    // If no selections found, indicate the issue
    if (selections.length === 0 && order.box_size === 'full_farm_bag') {
      return 'Full Farm Bag (selections not saved)';
    }
    
    return selections.length > 0 ? selections.join(' | ') : 'No selections';
  };

  const exportOrderData = async () => {
    try {
      const ordersToExport = getFilteredOrders();
      
      // Enhanced CSV with all customer information
      const headers = [
        'Order ID',
        'Order Date',
        'Customer Name',
        'Customer Email', 
        'Customer Phone',
        'Box Type',
        'Customer Selections',
        'Delivery Preference',
        'Customer Notes',
        'Delivery Address',
        'Apartment/Unit',
        'City',
        'State',
        'ZIP',
        'Delivery Instructions',
        'Status',
        'Payment Status',
        'Box Price',
        'Addons Total',
        'Delivery Fee',
        'Total Amount',
        'Items Summary'
      ];

      const csvContent = [
        headers.join(','),
        ...ordersToExport.map(order => [
          order.id,
          new Date(order.order_date).toLocaleDateString(),
          `"${order.customer_name || getCustomerName(order)}"`,
          `"${order.customer_email || ''}"`,
          `"${order.customer_phone || ''}"`,
          `"${getDisplayName(order.box_size)}"`,
          `"${getCustomerSelections(order)}"`,
          `"${order.delivery_day_preference || ''} ${order.delivery_time_preference || ''}".trim()`,
          `"${order.customer_notes || ''}"`,
          `"${order.shipping_address_street || ''}"`,
          `"${order.shipping_address_apartment || ''}"`,
          `"${order.shipping_address_city || ''}"`,
          `"${order.shipping_address_state || ''}"`,
          `"${order.shipping_address_zip || ''}"`,
          `"${order.delivery_instructions || ''}"`,
          order.status,
          order.payment_status || 'unknown',
          order.box_price || 0,
          order.addons_total || 0,
          order.delivery_fee || 0,
          order.total_amount,
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
      const fileName = `enhanced-orders-export-${new Date().toISOString().split('T')[0]}.csv`;
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
      
      return matchesSearch && matchesStatus;
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
      {/* Header with insights and export */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Enhanced Order Management</h2>
        <div className="flex gap-2">
          <OrderInsights />
          <Button onClick={exportOrderData}>
            <Download className="h-4 w-4 mr-2" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Label htmlFor="status">Filter by Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Box Type</TableHead>
                <TableHead>Customer Selections</TableHead>
                <TableHead>Delivery Preference</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Notes</TableHead>
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
                      <p className="font-medium">{getCustomerName(order)}</p>
                      {order.customer_email && (
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      )}
                      {order.customer_phone && (
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{getDisplayName(order.box_size)}</p>
                      <p className="text-muted-foreground">${order.box_price?.toFixed(2) || '0.00'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs">
                      <p className="text-muted-foreground">{getCustomerSelections(order)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.delivery_day_preference && (
                        <p className="font-medium">{order.delivery_day_preference}</p>
                      )}
                      {order.delivery_time_preference && (
                        <p className="text-muted-foreground">{order.delivery_time_preference}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs">
                      <p>{getFullAddress(order)}</p>
                      {order.delivery_instructions && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Instructions: {order.delivery_instructions}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs">
                      {order.customer_notes ? (
                        <p className="text-muted-foreground">{order.customer_notes}</p>
                      ) : (
                        <p className="text-muted-foreground italic">No notes</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${order.total_amount.toFixed(2)}
                    <div className="text-xs text-muted-foreground">
                      +${order.addons_total?.toFixed(2) || '0.00'} add-ons
                    </div>
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
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};