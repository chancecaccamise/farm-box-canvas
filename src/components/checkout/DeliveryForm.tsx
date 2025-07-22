
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Truck, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeliveryFormProps {
  onSubmit: (deliveryData: DeliveryData) => void;
  loading?: boolean;
}

export interface DeliveryData {
  fullName: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  deliveryInstructions?: string;
}

export default function DeliveryForm({ onSubmit, loading = false }: DeliveryFormProps) {
  const [formData, setFormData] = useState<DeliveryData>({
    fullName: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    deliveryInstructions: "",
  });

  const [errors, setErrors] = useState<Partial<DeliveryData>>({});
  const [existingAddress, setExistingAddress] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExistingAddress();
  }, []);

  const fetchExistingAddress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching address:', error);
        return;
      }

      if (data) {
        setExistingAddress(data);
        // Pre-fill form with existing data
        setFormData({
          fullName: `${data.street_address}`, // We'll need to get name from profiles
          streetAddress: data.street_address,
          apartment: data.apartment || "",
          city: data.city,
          state: data.state,
          zipCode: data.zip_code,
          phoneNumber: "", // We'll need to get phone from profiles
          deliveryInstructions: data.delivery_instructions || "",
        });
      } else {
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setShowForm(true);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<DeliveryData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name";
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Please enter your street address";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Please enter your city";
    }
    if (!formData.state.trim()) {
      newErrors.state = "Please enter your state";
    }
    if (!formData.zipCode.trim() || !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid ZIP code";
    }
    if (!formData.phoneNumber.trim() || !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Save or update delivery address
        const addressData = {
          user_id: user.id,
          street_address: formData.streetAddress,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          delivery_instructions: formData.deliveryInstructions,
          is_primary: true,
        };

        if (existingAddress) {
          await supabase
            .from('delivery_addresses')
            .update(addressData)
            .eq('id', existingAddress.id);
        } else {
          await supabase
            .from('delivery_addresses')
            .insert(addressData);
        }

        onSubmit(formData);
      } catch (error) {
        console.error('Error saving address:', error);
        toast({
          title: "Error",
          description: "Failed to save delivery address. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (existingAddress && !showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{existingAddress.street_address}</p>
            {existingAddress.apartment && <p>{existingAddress.apartment}</p>}
            <p>{existingAddress.city}, {existingAddress.state} {existingAddress.zip_code}</p>
            {existingAddress.delivery_instructions && (
              <p className="text-sm text-muted-foreground">{existingAddress.delivery_instructions}</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowForm(true)}
            className="mt-4"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Address
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Delivery Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="streetAddress">Street Address</Label>
            <Input
              id="streetAddress"
              type="text"
              value={formData.streetAddress}
              onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
              className={errors.streetAddress ? "border-destructive" : ""}
            />
            {errors.streetAddress && <p className="text-sm text-destructive">{errors.streetAddress}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apartment">Apartment/Unit (Optional)</Label>
            <Input
              id="apartment"
              type="text"
              value={formData.apartment}
              onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={errors.city ? "border-destructive" : ""}
              />
              {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={errors.state ? "border-destructive" : ""}
              />
              {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              className={errors.zipCode ? "border-destructive" : ""}
            />
            {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className={errors.phoneNumber ? "border-destructive" : ""}
            />
            {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="deliveryInstructions"
              value={formData.deliveryInstructions}
              onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
              placeholder="Any special instructions for delivery..."
              rows={3}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
