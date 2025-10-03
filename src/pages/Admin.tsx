import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag, Users, Fish, Flower, MapPin, UserCheck, Camera, Calendar } from 'lucide-react';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminBoxTemplates } from '@/components/admin/AdminBoxTemplates';
import { EnhancedOrderManagement } from '@/components/admin/EnhancedOrderManagement';
import { AdminFreshCatch } from '@/components/admin/AdminFreshCatch';
import { AdminRecentNews } from '@/components/admin/AdminRecentNews';
import { AdminFormSubmissions } from '@/components/admin/AdminFormSubmissions';
import { AdminGallery } from '@/components/admin/AdminGallery';
import { AdminDeliveryAreas } from '@/components/admin/AdminDeliveryAreas';
import { TestCleanup } from '@/components/TestCleanup';
import { AdminDeliveryDays } from '@/components/admin/AdminDeliveryDays';
import { AdminUserPreferences } from '@/components/admin/AdminUserPreferences';

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
          <TabsList className="grid w-full grid-cols-11">
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
            <TabsTrigger value="recent-news" className="flex items-center gap-2">
              <Flower className="h-4 w-4" />
              Recent News
            </TabsTrigger>
            <TabsTrigger value="form-submissions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Form Submissions
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Ana's Gallery
            </TabsTrigger>
            <TabsTrigger value="delivery-areas" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Areas
            </TabsTrigger>
            <TabsTrigger value="delivery-days" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Delivery Days
            </TabsTrigger>
            <TabsTrigger value="user-preferences" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="test-cleanup" className="flex items-center gap-2">
              🧹
              Test Cleanup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="boxes">
            <AdminBoxTemplates />
          </TabsContent>

          <TabsContent value="orders">
            <EnhancedOrderManagement />
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

          <TabsContent value="recent-news">
            <Card>
              <CardHeader>
                <CardTitle>Recent News Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminRecentNews />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form-submissions">
            <AdminFormSubmissions />
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardContent>
                <AdminGallery />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery-areas">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Areas Management</CardTitle>
                <CardDescription>
                  Manage ZIP codes where delivery is available. Only users in these areas can sign up for service.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminDeliveryAreas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery-days">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Days Management</CardTitle>
                <CardDescription>
                  Control which days are available for delivery. Disabled days will appear crossed out and non-selectable for customers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminDeliveryDays />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-preferences">
            <Card>
              <CardHeader>
                <CardTitle>User Marketing Preferences</CardTitle>
                <CardDescription>
                  View user contact information, marketing preferences, and subscription status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserPreferences />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test-cleanup">
            <Card>
              <CardHeader>
                <CardTitle>Test Data Cleanup</CardTitle>
                <CardDescription>
                  Clean up pending test orders and reset the system for testing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TestCleanup />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;