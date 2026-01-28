import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutStatus {
  isCheckoutPaused: boolean;
  pauseMessage: string;
  loading: boolean;
}

export function useCheckoutStatus(): CheckoutStatus {
  const [isCheckoutPaused, setIsCheckoutPaused] = useState(false);
  const [pauseMessage, setPauseMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('checkout_paused, checkout_paused_message')
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching checkout status:', error);
          setLoading(false);
          return;
        }
        
        setIsCheckoutPaused(data?.checkout_paused || false);
        setPauseMessage(data?.checkout_paused_message || "We're taking a short break! Check back soon.");
        setLoading(false);
      } catch (error) {
        console.error('Error fetching checkout status:', error);
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return { isCheckoutPaused, pauseMessage, loading };
}
