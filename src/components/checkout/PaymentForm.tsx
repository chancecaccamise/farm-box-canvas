
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface PaymentFormProps {
  onSubmit: (paymentData: PaymentData) => void;
  loading?: boolean;
}

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function PaymentForm({ onSubmit, loading = false }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentData>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [errors, setErrors] = useState<Partial<PaymentData>>({});

  const validateForm = () => {
    const newErrors: Partial<PaymentData> = {};

    // Remove spaces for validation but keep original format
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean || cardNumberClean.length < 16) {
      newErrors.cardNumber = "Please enter a valid card number";
    }
    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = "Please enter expiry date (MM/YY)";
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = "Please enter a valid CVV";
    }
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Please enter cardholder name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-submit when form is valid
  useEffect(() => {
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [formData, onSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => 
                setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })
              }
              maxLength={19}
              className={errors.cardNumber ? "border-destructive" : ""}
            />
            {errors.cardNumber && <p className="text-sm text-destructive">{errors.cardNumber}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={(e) => 
                  setFormData({ ...formData, expiryDate: formatExpiryDate(e.target.value) })
                }
                maxLength={5}
                className={errors.expiryDate ? "border-destructive" : ""}
              />
              {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => 
                  setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })
                }
                maxLength={4}
                className={errors.cvv ? "border-destructive" : ""}
              />
              {errors.cvv && <p className="text-sm text-destructive">{errors.cvv}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              value={formData.cardholderName}
              onChange={(e) => 
                setFormData({ ...formData, cardholderName: e.target.value })
              }
              className={errors.cardholderName ? "border-destructive" : ""}
            />
            {errors.cardholderName && <p className="text-sm text-destructive">{errors.cardholderName}</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
