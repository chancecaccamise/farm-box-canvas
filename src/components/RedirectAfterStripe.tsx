import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const RedirectAfterStripe = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const stripeRedirect = searchParams.get('stripe_redirect');
    
    if (stripeRedirect) {
      // Get all current search params to preserve them
      const sessionId = searchParams.get('session_id');
      const cancelled = searchParams.get('cancelled');
      
      // Build the new URL with preserved params
      const params = new URLSearchParams();
      if (sessionId) params.set('session_id', sessionId);
      if (cancelled) params.set('cancelled', cancelled);
      
      const queryString = params.toString();
      const targetUrl = `/${stripeRedirect}${queryString ? `?${queryString}` : ''}`;
      
      // Navigate to the correct page
      navigate(targetUrl, { replace: true });
    }
  }, [navigate, searchParams]);

  return null; // This component doesn't render anything
};

export default RedirectAfterStripe;