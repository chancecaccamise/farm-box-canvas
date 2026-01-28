import { PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckoutPausedBannerProps {
  message: string;
  showButton?: boolean;
  buttonText?: string;
}

export const CheckoutPausedBanner = ({ 
  message, 
  showButton = true,
  buttonText = "Checkout Currently Unavailable"
}: CheckoutPausedBannerProps) => {
  return (
    <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center space-y-4">
      <div className="flex items-center justify-center gap-2 text-amber-700">
        <PauseCircle className="w-6 h-6" />
        <span className="font-semibold text-lg">We're Taking a Short Break</span>
      </div>
      <p className="text-amber-800">
        {message}
      </p>
      {showButton && (
        <Button disabled className="w-full mt-4 bg-amber-200 text-amber-800 cursor-not-allowed">
          {buttonText}
        </Button>
      )}
    </div>
  );
};
