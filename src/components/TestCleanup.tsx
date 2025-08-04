import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TestCleanup() {
  const { toast } = useToast();

  const cleanTestData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('clean-test-data');
      
      if (error) {
        console.error('Error cleaning test data:', error);
        toast({
          title: "Error",
          description: "Failed to clean test data",
          variant: "destructive"
        });
      } else {
        console.log('Test data cleaned:', data);
        toast({
          title: "Success",
          description: "Test data cleaned successfully",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to clean test data",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Data Cleanup</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={cleanTestData} className="w-full">
          Clean Test Data
        </Button>
      </CardContent>
    </Card>
  );
}