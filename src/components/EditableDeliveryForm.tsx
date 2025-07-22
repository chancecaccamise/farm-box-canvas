
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

interface DeliveryAddress {
  id: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  zip_code: string;
  delivery_instructions?: string;
}

interface EditableDeliveryFormProps {
  address: DeliveryAddress | null;
  onAddressUpdate: (address: DeliveryAddress) => void;
}

export function EditableDeliveryForm({ address, onAddressUpdate }: EditableDeliveryFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    street_address: "",
    apartment: "",
    city: "",
    state: "",
    zip_code: "",
    delivery_instructions: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (address) {
      setFormData({
        street_address: address.street_address,
        apartment: address.apartment || "",
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        delivery_instructions: address.delivery_instructions || "",
      });
    }
  }, [address]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.street_address.trim()) {
      newErrors.street_address = "Street address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.zip_code.trim() || !/^\d{5}(-\d{4})?$/.test(formData.zip_code)) {
      newErrors.zip_code = "Valid ZIP code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validateForm()) return;

    setSaving(true);
    try {
      const addressData = {
        user_id: user.id,
        street_address: formData.street_address,
        apartment: formData.apartment || null,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        delivery_instructions: formData.delivery_instructions || null,
        is_primary: true,
      };

      if (address) {
        // Update existing address
        const { data, error } = await supabase
          .from('delivery_addresses')
          .update(addressData)
          .eq('id', address.id)
          .select()
          .single();

        if (error) throw error;
        onAddressUpdate(data);
      } else {
        // Create new address
        const { data, error } = await supabase
          .from('delivery_addresses')
          .insert(addressData)
          .select()
          .single();

        if (error) throw error;
        onAddressUpdate(data);
      }

      setIsEditing(false);
      toast({
        title: "Address Updated",
        description: "Your delivery address has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (address) {
      setFormData({
        street_address: address.street_address,
        apartment: address.apartment || "",
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        delivery_instructions: address.delivery_instructions || "",
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  if (!isEditing && address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Delivery Information</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="font-medium">{address.street_address}</p>
            {address.apartment && <p>{address.apartment}</p>}
            <p>{address.city}, {address.state} {address.zip_code}</p>
          </div>
          {address.delivery_instructions && (
            <div>
              <Label className="text-sm font-medium">Delivery Instructions</Label>
              <p className="text-sm text-muted-foreground">{address.delivery_instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Delivery Information</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="street_address">Street Address</Label>
          <Input
            id="street_address"
            value={formData.street_address}
            onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
            className={errors.street_address ? "border-destructive" : ""}
          />
          {errors.street_address && (
            <p className="text-sm text-destructive">{errors.street_address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apartment">Apartment/Unit (Optional)</Label>
          <Input
            id="apartment"
            value={formData.apartment}
            onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className={errors.state ? "border-destructive" : ""}
            />
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip_code">ZIP Code</Label>
          <Input
            id="zip_code"
            value={formData.zip_code}
            onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
            className={errors.zip_code ? "border-destructive" : ""}
          />
          {errors.zip_code && (
            <p className="text-sm text-destructive">{errors.zip_code}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="delivery_instructions">Delivery Instructions (Optional)</Label>
          <Textarea
            id="delivery_instructions"
            value={formData.delivery_instructions}
            onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
            placeholder="Any special instructions for delivery..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
