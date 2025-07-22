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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Edit, Search, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FreshFishAlert {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  preferred_fish_types: string[] | null;
  delivery_preferences: string | null;
  communication_preferences: string[] | null;
  zip_code: string | null;
  special_requests: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const AdminFreshFishAlerts = () => {
  const [alerts, setAlerts] = useState<FreshFishAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<FreshFishAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<FreshFishAlert | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    status: '',
    admin_notes: ''
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchTerm, statusFilter]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('fresh_fish_alerts_enhanced')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching fresh fish alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fresh fish alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.phone_number.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    setFilteredAlerts(filtered);
  };

  const updateAlert = async () => {
    if (!selectedAlert) return;

    try {
      const { error } = await supabase
        .from('fresh_fish_alerts_enhanced')
        .update({
          status: editForm.status,
          admin_notes: editForm.admin_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAlert.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert updated successfully"
      });

      setIsDialogOpen(false);
      fetchAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (alert: FreshFishAlert) => {
    setSelectedAlert(alert);
    setEditForm({
      status: alert.status,
      admin_notes: alert.admin_notes || ''
    });
    setIsDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Preferred Fish Types', 'Delivery Preferences',
      'Communication Preferences', 'Zip Code', 'Special Requests', 'Status', 
      'Admin Notes', 'Created At'
    ];

    const csvData = filteredAlerts.map(alert => [
      alert.name,
      alert.email,
      alert.phone_number,
      alert.preferred_fish_types?.join('; ') || '',
      alert.delivery_preferences || '',
      alert.communication_preferences?.join('; ') || '',
      alert.zip_code || '',
      alert.special_requests || '',
      alert.status,
      alert.admin_notes || '',
      new Date(alert.created_at).toLocaleString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fresh-fish-alerts-${new Date().toISOString().split('T')[0]}.csv`;
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
      case 'active': return 'default';
      case 'inactive': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading fresh fish alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fresh Fish Alerts</h2>
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
              placeholder="Search by name, email, or phone..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Preferences</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <div className="font-medium">{alert.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {alert.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {alert.phone_number}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {alert.preferred_fish_types && alert.preferred_fish_types.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {alert.preferred_fish_types.slice(0, 2).map((fish, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {fish}
                            </Badge>
                          ))}
                          {alert.preferred_fish_types.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{alert.preferred_fish_types.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Any fish</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {alert.zip_code || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(alert.status)}>
                      {alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(alert.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(alert)}
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

      {filteredAlerts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No fresh fish alerts found.
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Fresh Fish Alert</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p>{selectedAlert.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAlert.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedAlert.phone_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p>{selectedAlert.zip_code || 'Not specified'}</p>
                </div>
                {selectedAlert.preferred_fish_types && (
                  <div>
                    <Label className="text-sm font-medium">Preferred Fish</Label>
                    <p className="text-sm">{selectedAlert.preferred_fish_types.join(', ')}</p>
                  </div>
                )}
                {selectedAlert.delivery_preferences && (
                  <div>
                    <Label className="text-sm font-medium">Delivery Preferences</Label>
                    <p className="text-sm">{selectedAlert.delivery_preferences}</p>
                  </div>
                )}
                {selectedAlert.communication_preferences && (
                  <div>
                    <Label className="text-sm font-medium">Communication</Label>
                    <p className="text-sm">{selectedAlert.communication_preferences.join(', ')}</p>
                  </div>
                )}
                {selectedAlert.special_requests && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Special Requests</Label>
                    <p className="text-sm">{selectedAlert.special_requests}</p>
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="admin_notes">Admin Notes</Label>
                  <Textarea
                    id="admin_notes"
                    value={editForm.admin_notes}
                    onChange={(e) => setEditForm({...editForm, admin_notes: e.target.value})}
                    placeholder="Add internal notes about this alert subscription..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateAlert}>
                  Update Alert
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};