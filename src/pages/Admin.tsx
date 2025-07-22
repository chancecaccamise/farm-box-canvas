import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag, Users, Fish, Flower } from 'lucide-react';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminBoxTemplates } from '@/components/admin/AdminBoxTemplates';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminFreshCatch } from '@/components/admin/AdminFreshCatch';
import { AdminBouquetRequests } from '@/components/admin/AdminBouquetRequests';
import { AdminFreshFishAlerts } from '@/components/admin/AdminFreshFishAlerts';

const Admin = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_current_user_admin');
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">⚙️</span>
          </div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your farm operation</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="boxes" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Box Templates
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="fresh-catch" className="flex items-center gap-2">
              <Fish className="h-4 w-4" />
              Fresh Catch
            </TabsTrigger>
            <TabsTrigger value="arrangements" className="flex items-center gap-2">
              <Flower className="h-4 w-4" />
              Ana's Arrangements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="boxes">
            <AdminBoxTemplates />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="fresh-catch">
            <Card>
              <CardHeader>
                <CardTitle>Fresh Catch Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminFreshCatch />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arrangements">
            <Card>
              <CardHeader>
                <CardTitle>Ana's Arrangements & Fresh Fish Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="bouquets" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="bouquets">Bouquet Requests</TabsTrigger>
                    <TabsTrigger value="alerts">Fish Alerts</TabsTrigger>
                  </TabsList>
                  <TabsContent value="bouquets">
                    <AdminBouquetRequests />
                  </TabsContent>
                  <TabsContent value="alerts">
                    <AdminFreshFishAlerts />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;