import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceableZipCode {
  zip_code: string;
  city: string;
  state: string;
  is_active: boolean;
}

export interface ZipCodeValidationResult {
  isValid: boolean | null;
  isLoading: boolean;
  error: string | null;
  zipCodeData: ServiceableZipCode | null;
}

export const useZipCodeValidation = (zipCode: string) => {
  const [validationResult, setValidationResult] = useState<ZipCodeValidationResult>({
    isValid: null,
    isLoading: false,
    error: null,
    zipCodeData: null,
  });

  useEffect(() => {
    const validateZipCode = async () => {
      // Reset state
      setValidationResult({
        isValid: null,
        isLoading: false,
        error: null,
        zipCodeData: null,
      });

      // Don't validate if zip code is empty or not 5 digits
      if (!zipCode || zipCode.length !== 5) {
        return;
      }

      setValidationResult(prev => ({ ...prev, isLoading: true }));

      try {
        const { data, error } = await supabase
          .from('serviceable_zip_codes')
          .select('*')
          .eq('zip_code', zipCode)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          setValidationResult({
            isValid: false,
            isLoading: false,
            error: 'Failed to validate ZIP code. Please try again.',
            zipCodeData: null,
          });
          return;
        }

        setValidationResult({
          isValid: !!data,
          isLoading: false,
          error: null,
          zipCodeData: data,
        });
      } catch (err) {
        setValidationResult({
          isValid: false,
          isLoading: false,
          error: 'Network error. Please check your connection and try again.',
          zipCodeData: null,
        });
      }
    };

    // Debounce the validation call
    const timeoutId = setTimeout(validateZipCode, 500);
    return () => clearTimeout(timeoutId);
  }, [zipCode]);

  return validationResult;
};