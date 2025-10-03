import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UserPreference {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  sms_notifications: boolean;
  email_newsletter: boolean;
  created_at: string;
  email: string | null;
  subscription_status: string | null;
  subscription_type: string | null;
  stripe_subscription_id: string | null;
}

export function AdminUserPreferences() {
  const [users, setUsers] = useState<UserPreference[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, users]);

  const fetchUserPreferences = async () => {
    try {
      setLoading(true);

      // Use the secure RPC function to fetch all user data
      const { data, error } = await supabase.rpc('get_admin_user_list');

      if (error) throw error;

      // Map the data to the expected format
      const combinedData: UserPreference[] = (data || []).map(user => ({
        user_id: user.user_id,
        email: user.email || null,
        first_name: user.first_name || null,
        last_name: user.last_name || null,
        phone: user.phone || null,
        sms_notifications: user.sms_notifications,
        email_newsletter: user.email_newsletter,
        created_at: user.created_at,
        subscription_status: user.subscription_status || null,
        subscription_type: user.subscription_type || null,
        stripe_subscription_id: user.stripe_subscription_id || null,
      }));

      setUsers(combinedData);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load user preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.first_name?.toLowerCase().includes(search) ||
        user.last_name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search)
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'sms':
        filtered = filtered.filter(u => u.sms_notifications);
        break;
      case 'email':
        filtered = filtered.filter(u => u.email_newsletter);
        break;
      case 'active-subscription':
        filtered = filtered.filter(u => u.subscription_status === 'active');
        break;
      case 'has-subscription':
        filtered = filtered.filter(u => !!u.stripe_subscription_id);
        break;
    }

    setFilteredUsers(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'SMS Opt-in', 'Email Opt-in', 'Has Subscription', 'Subscription Status', 'Subscription Type', 'Sign Up Date'];
    const rows = filteredUsers.map(user => [
      `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      user.email || '',
      user.phone || '',
      user.sms_notifications ? 'Yes' : 'No',
      user.email_newsletter ? 'Yes' : 'No',
      user.stripe_subscription_id ? 'Yes' : 'No',
      user.subscription_status || 'None',
      user.subscription_type || 'None',
      format(new Date(user.created_at), 'yyyy-MM-dd')
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-preferences-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "User preferences exported to CSV",
    });
  };

  const totalSmsOptIns = users.filter(u => u.sms_notifications).length;
  const totalEmailOptIns = users.filter(u => u.email_newsletter).length;
  const totalActiveSubscriptions = users.filter(u => u.subscription_status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">SMS Opt-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSmsOptIns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Email Opt-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmailOptIns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="sms">SMS Opt-in Only</SelectItem>
            <SelectItem value="email">Email Opt-in Only</SelectItem>
            <SelectItem value="active-subscription">Active Subscribers</SelectItem>
            <SelectItem value="has-subscription">Has Subscription</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Preferences ({filteredUsers.length})</CardTitle>
          <CardDescription>
            View and manage user contact information and marketing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-center">SMS</TableHead>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sign Up Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        {user.sms_notifications ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {user.email_newsletter ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.stripe_subscription_id ? (
                          <Badge variant="secondary">{user.subscription_type || 'weekly'}</Badge>
                        ) : (
                          <Badge variant="outline">None</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.subscription_status === 'active' && (
                          <Badge className="bg-green-600">Active</Badge>
                        )}
                        {user.subscription_status === 'paused' && (
                          <Badge variant="secondary">Paused</Badge>
                        )}
                        {user.subscription_status === 'cancelled' && (
                          <Badge variant="outline">Cancelled</Badge>
                        )}
                        {!user.subscription_status && (
                          <Badge variant="outline">None</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
