import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Eye, Edit, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BouquetRequest {
  id: string;
  name: string;
  email: string;
  event_type: string;
  event_date: string | null;
  color_palette: string | null;
  preferences: string | null;
  reference_photos: string[] | null;
  status: string;
  admin_notes: string | null;
  estimated_price: number | null;
  created_at: string;
  updated_at: string;
}

export const AdminBouquetRequests = () => {
  const [requests, setRequests] = useState<BouquetRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BouquetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<BouquetRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    status: '',
    admin_notes: '',
    estimated_price: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('bouquet_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching bouquet requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bouquet requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.event_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const updateRequest = async () => {
    if (!selectedRequest) return;

    try {
      const updateData: any = {
        status: editForm.status,
        admin_notes: editForm.admin_notes || null,
        updated_at: new Date().toISOString()
      };

      if (editForm.estimated_price) {
        updateData.estimated_price = parseFloat(editForm.estimated_price);
      }

      const { error } = await supabase
        .from('bouquet_requests')
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request updated successfully"
      });

      setIsDialogOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error", 
        description: "Failed to update request",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (request: BouquetRequest) => {
    setSelectedRequest(request);
    setEditForm({
      status: request.status,
      admin_notes: request.admin_notes || '',
      estimated_price: request.estimated_price?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = [
      'Name', 'Email', 'Event Type', 'Event Date', 'Color Palette', 
      'Preferences', 'Status', 'Admin Notes', 'Estimated Price', 'Created At'
    ];

    const csvData = filteredRequests.map(request => [
      request.name,
      request.email,
      request.event_type,
      request.event_date || '',
      request.color_palette || '',
      request.preferences || '',
      request.status,
      request.admin_notes || '',
      request.estimated_price || '',
      new Date(request.created_at).toLocaleString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bouquet-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Data exported to CSV successfully"
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'contacted': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading bouquet requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ana's Arrangements</h2>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or event type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.name}</div>
                      <div className="text-sm text-muted-foreground">{request.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.event_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {request.event_date ? new Date(request.event_date).toLocaleDateString() : 'Not specified'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.estimated_price ? `$${request.estimated_price}` : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(request)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredRequests.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No bouquet requests found.
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bouquet Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p>{selectedRequest.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Event</Label>
                  <p>{selectedRequest.event_type}</p>
                  {selectedRequest.event_date && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedRequest.event_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {selectedRequest.color_palette && (
                  <div>
                    <Label className="text-sm font-medium">Color Palette</Label>
                    <p className="text-sm">{selectedRequest.color_palette}</p>
                  </div>
                )}
                {selectedRequest.preferences && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Preferences</Label>
                    <p className="text-sm">{selectedRequest.preferences}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimated_price">Estimated Price ($)</Label>
                  <Input
                    id="estimated_price"
                    type="number"
                    step="0.01"
                    value={editForm.estimated_price}
                    onChange={(e) => setEditForm({...editForm, estimated_price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="admin_notes">Admin Notes</Label>
                  <Textarea
                    id="admin_notes"
                    value={editForm.admin_notes}
                    onChange={(e) => setEditForm({...editForm, admin_notes: e.target.value})}
                    placeholder="Add internal notes about this request..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateRequest}>
                  Update Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};