import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search, Fish, Wheat, Package, Apple, Salad, Cookie } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from './ImageUpload';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  is_available: boolean;
  inventory_count?: number;
  tags?: string[];
  unit_description?: string;
}

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    is_available: true,
    inventory_count: '100',
    tags: '',
    unit_description: ''
  });

  const allCategories = ['vegetables', 'fruits', 'herbs', 'dairy', 'meat', 'fish', 'bakery', 'proteins', 'carbs', 'other', 'addons'];
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'proteins': return <Fish className="h-4 w-4" />;
      case 'carbs': return <Wheat className="h-4 w-4" />;
      case 'fruits': return <Apple className="h-4 w-4" />;
      case 'vegetables': return <Salad className="h-4 w-4" />;
      case 'bakery': return <Cookie className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryDisplayName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Get unique categories from products
    const uniqueCategories = [...new Set(products.map(p => p.category))].sort();
    setAvailableCategories(uniqueCategories);
  }, [products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Error",
        description: "Name, price, and category are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description || null,
        image: formData.image || null,
        is_available: formData.is_available,
        inventory_count: parseInt(formData.inventory_count) || 100,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null,
        unit_description: formData.unit_description || null
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Product created successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || '',
      image: product.image || '',
      is_available: product.is_available,
      inventory_count: product.inventory_count?.toString() || '100',
      tags: product.tags?.join(', ') || '',
      unit_description: product.unit_description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: currentCategory === 'all' ? '' : currentCategory,
      price: '',
      description: '',
      image: '',
      is_available: true,
      inventory_count: '100',
      tags: '',
      unit_description: ''
    });
    setEditingProduct(null);
  };

  const toggleAvailability = async (productId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !isAvailable })
        .eq('id', productId);

      if (error) throw error;
      toast({
        title: "Success",
        description: `Product ${!isAvailable ? "enabled" : "disabled"} successfully!`,
      });
      fetchProducts();
    } catch (error: any) {
      console.error('Error updating product availability:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product availability.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Loading products...</div>;
  }

  // Create tab options: "All Products" + individual categories
  const tabOptions = ['all', ...availableCategories];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Management</h2>
      </div>

      <Tabs value={currentCategory} onValueChange={setCurrentCategory} className="space-y-6">
        <TabsList className={`grid w-full ${tabOptions.length <= 3 ? 'max-w-md grid-cols-3' : tabOptions.length <= 4 ? 'max-w-2xl grid-cols-4' : 'max-w-4xl grid-cols-5'}`}>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Products
          </TabsTrigger>
          {availableCategories.map(category => (
            <TabsTrigger key={category} value={category} className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {getCategoryDisplayName(category)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={currentCategory} className="space-y-6">
          <div className="flex justify-between items-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {currentCategory === 'all' ? 'Product' : getCategoryDisplayName(currentCategory)}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {getCategoryDisplayName(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="inventory">Inventory Count</Label>
                      <Input
                        id="inventory"
                        type="number"
                        value={formData.inventory_count}
                        onChange={(e) => setFormData({...formData, inventory_count: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="unit_description">Unit Description</Label>
                    <Input
                      id="unit_description"
                      value={formData.unit_description}
                      onChange={(e) => setFormData({...formData, unit_description: e.target.value})}
                      placeholder="e.g., 1 lb fillet, 2 lb bag, per bunch"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({...formData, image: url})}
                    label="Product Image"
                    placeholder="Drop an image here or click to upload"
                  />

                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="organic, local, seasonal"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={formData.is_available}
                      onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                    />
                    <Label htmlFor="available">Available for purchase</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProduct ? 'Update' : 'Create'} Product
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={`Search ${currentCategory === 'all' ? 'products' : currentCategory}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-4">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(product.category)}
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                        </div>
                        <p className="text-muted-foreground mb-2">{product.description}</p>
                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                          <Badge variant="secondary">{getCategoryDisplayName(product.category)}</Badge>
                          <span className="font-semibold">${product.price}</span>
                          {product.unit_description && (
                            <Badge variant="outline">{product.unit_description}</Badge>
                          )}
                          <Badge
                            variant={product.is_available ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleAvailability(product.id, product.is_available)}
                          >
                            {product.is_available ? "Available" : "Unavailable"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Stock: {product.inventory_count || 0}
                          </span>
                        </div>
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex space-x-1 mt-2">
                            {product.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No {currentCategory === 'all' ? 'products' : currentCategory} found.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};