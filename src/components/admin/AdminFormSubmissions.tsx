import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fish, Flower, UserCheck } from 'lucide-react';
import { AdminFreshFishAlerts } from './AdminFreshFishAlerts';
import { AdminBouquetRequests } from './AdminBouquetRequests';
import { AdminPartnerApplications } from './AdminPartnerApplications';

export const AdminFormSubmissions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fish-alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fish-alerts" className="flex items-center gap-2">
              <Fish className="h-4 w-4" />
              Fish Alerts
            </TabsTrigger>
            <TabsTrigger value="bouquet-requests" className="flex items-center gap-2">
              <Flower className="h-4 w-4" />
              Bouquet Requests
            </TabsTrigger>
            <TabsTrigger value="partner-applications" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Partner Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fish-alerts">
            <AdminFreshFishAlerts />
          </TabsContent>

          <TabsContent value="bouquet-requests">
            <AdminBouquetRequests />
          </TabsContent>

          <TabsContent value="partner-applications">
            <AdminPartnerApplications />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};