import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Minus, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
}

interface BoxTemplate {
  id: string;
  week_start_date: string;
  box_size: string;
  product_id: string;
  quantity: number;
  products: Product;
}

interface BoxSize {
  name: string;
  display_name: string;
  base_price: number;
}

export const AdminBoxTemplates = () => {
  const [templates, setTemplates] = useState<BoxTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [boxSizes, setBoxSizes] = useState<BoxSize[]>([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedBoxSize, setSelectedBoxSize] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    setSelectedWeek(getCurrentWeekStart());
  }, []);

  useEffect(() => {
    if (selectedWeek && selectedBoxSize) {
      fetchTemplates();
    }
  }, [selectedWeek, selectedBoxSize]);

  const getCurrentWeekStart = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  };

  const fetchData = async () => {
    try {
      const [productsRes, boxSizesRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_available', true).order('name'),
        supabase.from('box_sizes').select('*').eq('is_active', true).order('name')
      ]);

      if (productsRes.error) throw productsRes.error;
      if (boxSizesRes.error) throw boxSizesRes.error;

      setProducts(productsRes.data || []);
      setBoxSizes(boxSizesRes.data || []);
      
      if (boxSizesRes.data && boxSizesRes.data.length > 0) {
        setSelectedBoxSize(boxSizesRes.data[0].name);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!selectedWeek || !selectedBoxSize) return;

    try {
      const { data, error } = await supabase
        .from('box_templates')
        .select(`
          *,
          products (*)
        `)
        .eq('week_start_date', selectedWeek)
        .eq('box_size', selectedBoxSize);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch box templates",
        variant: "destructive"
      });
    }
  };

  const addProductToBox = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('box_templates')
        .insert([{
          week_start_date: selectedWeek,
          box_size: selectedBoxSize,
          product_id: productId,
          quantity: 1
        }]);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Product added to box template"
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product to box",
        variant: "destructive"
      });
    }
  };

  const updateQuantity = async (templateId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromBox(templateId);
      return;
    }

    try {
      const { error } = await supabase
        .from('box_templates')
        .update({ quantity: newQuantity })
        .eq('id', templateId);

      if (error) throw error;
      fetchTemplates();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  const removeFromBox = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('box_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Product removed from box template"
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error removing product:', error);
      toast({
        title: "Error",
        description: "Failed to remove product",
        variant: "destructive"
      });
    }
  };

  const copyFromPreviousWeek = async () => {
    const previousWeek = new Date(selectedWeek);
    previousWeek.setDate(previousWeek.getDate() - 7);
    const previousWeekStr = previousWeek.toISOString().split('T')[0];

    try {
      const { data: prevTemplates, error: fetchError } = await supabase
        .from('box_templates')
        .select('product_id, quantity')
        .eq('week_start_date', previousWeekStr)
        .eq('box_size', selectedBoxSize);

      if (fetchError) throw fetchError;

      if (!prevTemplates || prevTemplates.length === 0) {
        toast({
          title: "Info",
          description: "No templates found for previous week",
          variant: "default"
        });
        return;
      }

      // Delete current templates for this week/size
      await supabase
        .from('box_templates')
        .delete()
        .eq('week_start_date', selectedWeek)
        .eq('box_size', selectedBoxSize);

      // Insert new templates based on previous week
      const newTemplates = prevTemplates.map(template => ({
        week_start_date: selectedWeek,
        box_size: selectedBoxSize,
        product_id: template.product_id,
        quantity: template.quantity
      }));

      const { error: insertError } = await supabase
        .from('box_templates')
        .insert(newTemplates);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Box template copied from previous week"
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error copying template:', error);
      toast({
        title: "Error",
        description: "Failed to copy template from previous week",
        variant: "destructive"
      });
    }
  };

  const getAvailableProducts = () => {
    const templateProductIds = templates.map(t => t.product_id);
    return products.filter(p => !templateProductIds.includes(p.id));
  };

  const getTotalPrice = () => {
    const boxPrice = boxSizes.find(b => b.name === selectedBoxSize)?.base_price || 0;
    const productsPrice = templates.reduce((sum, template) => {
      return sum + (template.products.price * template.quantity);
    }, 0);
    return boxPrice + productsPrice;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Box Template Management</h2>
        <Button onClick={copyFromPreviousWeek} variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          Copy Previous Week
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="week">Week Starting</Label>
          <Input
            id="week"
            type="date"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="boxSize">Box Size</Label>
          <Select value={selectedBoxSize} onValueChange={setSelectedBoxSize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {boxSizes.map(size => (
                <SelectItem key={size.name} value={size.name}>
                  {size.display_name} (${size.base_price})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Box Contents</CardTitle>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No products in this box template yet.
              </p>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {template.products.image && (
                        <img
                          src={template.products.image}
                          alt={template.products.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{template.products.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${template.products.price} each
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(template.id, template.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{template.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(template.id, template.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total Box Value:</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getAvailableProducts().map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${product.price} • {product.category}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addProductToBox(product.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
              {getAvailableProducts().length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  All available products have been added to this box.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};