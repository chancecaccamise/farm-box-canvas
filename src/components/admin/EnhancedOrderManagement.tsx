import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, Package, Users, Trash2, X, Calendar, Check, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderInsights } from './OrderInsights';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  weekly_bag_id: string | null;
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
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription for orders, order_items, and weekly_bags
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
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'weekly_bags' },
        (payload) => {
          console.log('Weekly bag selections changed:', payload);
          fetchOrders(); // Refresh to get latest selections
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
      
      // Fetch latest selections from weekly_bags for subscription orders
      const weeklyBagIds = enhancedOrders
        .filter(o => o.weekly_bag_id)
        .map(o => o.weekly_bag_id as string);

      if (weeklyBagIds.length > 0) {
        const { data: weeklyBags } = await supabase
          .from('weekly_bags')
          .select('id, user_full_farm_bag_protein, user_full_farm_bag_carb, user_protein_selections, user_carb_selections')
          .in('id', weeklyBagIds);

        // Merge latest selections from weekly_bags into orders
        if (weeklyBags && weeklyBags.length > 0) {
          const weeklyBagMap = new Map(weeklyBags.map(wb => [wb.id, wb]));
          
          enhancedOrders.forEach(order => {
            if (order.weekly_bag_id && weeklyBagMap.has(order.weekly_bag_id)) {
              const wb = weeklyBagMap.get(order.weekly_bag_id)!;
              // Use weekly_bags as source of truth for selections
              order.user_full_farm_bag_protein = wb.user_full_farm_bag_protein;
              order.user_full_farm_bag_carb = wb.user_full_farm_bag_carb;
              order.user_protein_selections = wb.user_protein_selections;
              order.user_carb_selections = wb.user_carb_selections;
            }
          });
        }
      }

      // For orders still missing selections (no weekly_bag_id), fetch from previous orders
      const ordersNeedingFallback = enhancedOrders.filter(order => 
        (order.box_size === 'full_farm_bag' || order.box_size === 'protein-pack') &&
        !order.user_full_farm_bag_protein && 
        !order.user_protein_selections?.length
      );

      if (ordersNeedingFallback.length > 0) {
        // Get unique user IDs that need fallback
        const userIdsNeedingFallback = [...new Set(ordersNeedingFallback.map(o => o.user_id))];
        
        // Fetch the most recent order with selections for each user
        for (const userId of userIdsNeedingFallback) {
          const { data: prevOrder } = await supabase
            .from('orders')
            .select('user_full_farm_bag_protein, user_full_farm_bag_carb, user_protein_selections, user_carb_selections')
            .eq('user_id', userId)
            .or('user_full_farm_bag_protein.not.is.null,user_protein_selections.not.is.null')
            .order('order_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (prevOrder) {
            // Apply fallback selections to all orders for this user that need it
            enhancedOrders.forEach(order => {
              if (order.user_id === userId && 
                  (order.box_size === 'full_farm_bag' || order.box_size === 'protein-pack') &&
                  !order.user_full_farm_bag_protein && 
                  !order.user_protein_selections?.length) {
                order.user_full_farm_bag_protein = prevOrder.user_full_farm_bag_protein;
                order.user_full_farm_bag_carb = prevOrder.user_full_farm_bag_carb;
                order.user_protein_selections = prevOrder.user_protein_selections;
                order.user_carb_selections = prevOrder.user_carb_selections;
              }
            });
          }
        }
      }
      
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
    
    // Full Farm Bag: Show single protein and carb selections
    if (order.box_size === 'full_farm_bag') {
      if (order.user_full_farm_bag_protein) {
        const proteinName = productNames[order.user_full_farm_bag_protein] || order.user_full_farm_bag_protein;
        selections.push(`Protein: ${proteinName}`);
      }
      
      if (order.user_full_farm_bag_carb) {
        const carbName = productNames[order.user_full_farm_bag_carb] || order.user_full_farm_bag_carb;
        selections.push(`Carb: ${carbName}`);
      }
    }
    
    // Protein Pack: Show 5 protein selections only (no carbs)
    if (order.box_size === 'protein-pack') {
      if (order.user_protein_selections && order.user_protein_selections.length > 0) {
        const proteinNames = order.user_protein_selections.map(id => productNames[id] || id);
        selections.push(`Proteins: ${proteinNames.join(', ')}`);
      }
    }

    // For older orders or other box types, show any available selections as fallback
    if (selections.length === 0) {
      if (order.user_protein_selections && order.user_protein_selections.length > 0) {
        const proteinNames = order.user_protein_selections.map(id => productNames[id] || id);
        selections.push(`Proteins: ${proteinNames.join(', ')}`);
      }
      
      if (order.user_carb_selections && order.user_carb_selections.length > 0) {
        const carbNames = order.user_carb_selections.map(id => productNames[id] || id);
        selections.push(`Carbs: ${carbNames.join(', ')}`);
      }
    }

    // Special handling for full_farm_bag with missing selections
    if (selections.length === 0 && order.box_size === 'full_farm_bag') {
      return 'Full Farm Bag (selections not saved)';
    }
    
    return selections.length > 0 ? selections.join(' | ') : 'No selections';
  };

  const getAddOnsDisplay = (order: EnhancedOrder): string => {
    const addons = order.order_items.filter(item => item.item_type === 'addon');
    
    if (addons.length === 0) return 'No add-ons';
    
    return addons.map(item => 
      `${item.quantity}x ${item.product_name || item.products?.name || 'Unknown'} ($${item.price.toFixed(2)})`
    ).join(', ');
  };

  const exportOrderData = async () => {
    try {
      const ordersToExport = getFilteredOrders();
      
      // Enhanced CSV with all customer information
      const headers = [
        'Order ID',
        'Order Date',
        'Order Type',
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
        'Box Contents',
        'Add-Ons Purchased',
        'Add-Ons Details'
      ];

      const csvContent = [
        headers.join(','),
        ...ordersToExport.map(order => [
          order.id,
          new Date(order.order_date).toLocaleDateString(),
          order.order_type === 'subscription' ? 'Subscription' : 'One-Time',
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
          `"${order.order_items.filter(item => item.item_type !== 'addon').map(item => 
            `${item.quantity}x ${item.product_name || item.products?.name || 'Unknown'}`
          ).join('; ')}"`,
          `"${order.order_items.filter(item => item.item_type === 'addon').map(item => 
            `${item.quantity}x ${item.product_name || item.products?.name || 'Unknown'}`
          ).join('; ')}"`,
          `"${order.order_items.filter(item => item.item_type === 'addon').map(item => 
            `${item.quantity}x ${item.product_name || item.products?.name || 'Unknown'} ($${item.price.toFixed(2)})`
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

  // Parse delivery preference string (e.g., "Saturday, Jan 18") into a Date
  const parseDeliveryPreferenceDate = (preference: string | null): Date | null => {
    if (!preference) return null;
    
    // Extract "Jan 18" from "Saturday, Jan 18"
    const parts = preference.split(', ');
    if (parts.length < 2) return null;
    
    const dateStr = parts[1]; // "Jan 18"
    const currentYear = new Date().getFullYear();
    
    // Parse "Jan 18" into a proper date
    const parsed = new Date(`${dateStr}, ${currentYear}`);
    
    // Handle invalid dates
    if (isNaN(parsed.getTime())) return null;
    
    return parsed;
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = 
        getCustomerName(order).toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesOrderType = orderTypeFilter === 'all' || order.order_type === orderTypeFilter;
      
      // Date filtering by delivery_day_preference
      const deliveryDate = parseDeliveryPreferenceDate(order.delivery_day_preference);
      const matchesStartDate = !startDate || (deliveryDate && deliveryDate >= new Date(startDate));
      const matchesEndDate = !endDate || (deliveryDate && deliveryDate <= new Date(endDate + 'T23:59:59'));
      
      return matchesSearch && matchesStatus && matchesOrderType && matchesStartDate && matchesEndDate;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setOrderTypeFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(getFilteredOrders().map(order => order.id));
      setSelectedOrders(allIds);
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Delete order_items first (cascade might not be set up)
      await supabase.from('order_items').delete().eq('order_id', orderId);
      
      // Delete the order
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Order Deleted",
        description: "The order has been successfully deleted."
      });
      
      setOrderToDelete(null);
      setDeleteDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const orderIds = Array.from(selectedOrders);
      
      // Delete order_items first
      for (const orderId of orderIds) {
        await supabase.from('order_items').delete().eq('order_id', orderId);
      }
      
      // Delete orders
      const { error } = await supabase.from('orders').delete().in('id', orderIds);
      
      if (error) throw error;
      
      toast({
        title: "Orders Deleted",
        description: `${orderIds.length} orders have been successfully deleted.`
      });
      
      setSelectedOrders(new Set());
      setBulkDeleteDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting orders:', error);
      toast({
        title: "Error",
        description: "Failed to delete orders",
        variant: "destructive"
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`
      });
      
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newPaymentStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Payment Status Updated",
        description: `Payment status changed to ${newPaymentStatus}`
      });
      
      fetchOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  const handleBulkUpdateStatus = async (newStatus: string) => {
    try {
      const orderIds = Array.from(selectedOrders);
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', orderIds);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `${orderIds.length} orders marked as ${newStatus}`
      });
      
      setSelectedOrders(new Set());
      fetchOrders();
    } catch (error) {
      console.error('Error bulk updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update order statuses",
        variant: "destructive"
      });
    }
  };

  const handleBulkUpdatePayment = async (newPaymentStatus: string) => {
    try {
      const orderIds = Array.from(selectedOrders);
      
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newPaymentStatus, updated_at: new Date().toISOString() })
        .in('id', orderIds);
      
      if (error) throw error;
      
      toast({
        title: "Payment Status Updated",
        description: `${orderIds.length} orders marked as ${newPaymentStatus}`
      });
      
      setSelectedOrders(new Set());
      fetchOrders();
    } catch (error) {
      console.error('Error bulk updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment statuses",
        variant: "destructive"
      });
    }
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

  const getPaymentBadgeVariant = (paymentStatus: string | null) => {
    switch (paymentStatus) {
      case 'paid':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'outline';
      default:
        return 'secondary';
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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

        <div>
          <Label htmlFor="orderType">Filter by Order Type</Label>
          <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="one_time">One-Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="startDate">From Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="endDate">To Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg flex-wrap">
          <span className="text-sm font-medium">{selectedOrders.size} order(s) selected</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleBulkUpdateStatus('confirmed')}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark Confirmed
          </Button>
          <Button 
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleBulkUpdatePayment('paid')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Mark Paid
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setBulkDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedOrders(new Set())}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Enhanced Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order Type</TableHead>
                <TableHead>Box Type</TableHead>
                <TableHead>Customer Selections</TableHead>
                <TableHead>Add-Ons Purchased</TableHead>
                <TableHead>Delivery Preference</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                    />
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
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={order.order_type === 'subscription' ? 'default' : 'secondary'}
                      className={order.order_type === 'subscription' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}
                    >
                      {order.order_type === 'subscription' ? 'Subscription' : 'One-Time'}
                    </Badge>
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
                    <div className="text-sm max-w-xs">
                      <p className="text-muted-foreground">{getAddOnsDisplay(order)}</p>
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
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <Badge variant={getStatusBadgeVariant(order.status)} className="pointer-events-none">
                          {order.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={order.payment_status || 'pending'} 
                      onValueChange={(value) => handleUpdatePaymentStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-[100px] h-8">
                        <Badge variant={getPaymentBadgeVariant(order.payment_status)} className="pointer-events-none">
                          {order.payment_status || 'pending'}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setOrderToDelete(order.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => orderToDelete && handleDeleteOrder(orderToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedOrders.size} Orders</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedOrders.size} selected orders? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBulkDelete}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};