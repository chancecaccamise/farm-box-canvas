import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CheckoutState {
  boxType: 'subscription' | 'one-time';
  boxSize: 'small' | 'medium' | 'large';
  selectedItems: Record<string, number>;
  addOns: Record<string, number>; // Changed to Record<string, number> for quantities
  zipCode: string;
}

interface CheckoutContextType {
  checkoutState: CheckoutState;
  updateBoxType: (type: 'subscription' | 'one-time') => void;
  updateBoxSize: (size: 'small' | 'medium' | 'large') => void;
  updateSelectedItems: (items: Record<string, number>) => void;
  updateAddOns: (addOns: Record<string, number>) => void; // Updated type
  updateZipCode: (zipCode: string) => void;
  clearCheckout: () => void;
}

const initialState: CheckoutState = {
  boxType: 'subscription',
  boxSize: 'small',
  selectedItems: {},
  addOns: {}, // Changed to empty object
  zipCode: '',
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialState);

  const updateBoxType = (type: 'subscription' | 'one-time') => {
    setCheckoutState(prev => ({ ...prev, boxType: type }));
  };

  const updateBoxSize = (size: 'small' | 'medium' | 'large') => {
    setCheckoutState(prev => ({ ...prev, boxSize: size }));
  };

  const updateSelectedItems = (items: Record<string, number>) => {
    setCheckoutState(prev => ({ ...prev, selectedItems: items }));
  };

  const updateAddOns = (addOns: Record<string, number>) => {
    setCheckoutState(prev => ({ ...prev, addOns }));
  };

  const updateZipCode = (zipCode: string) => {
    setCheckoutState(prev => ({ ...prev, zipCode }));
  };

  const clearCheckout = () => {
    setCheckoutState(initialState);
  };

  const value: CheckoutContextType = {
    checkoutState,
    updateBoxType,
    updateBoxSize,
    updateSelectedItems,
    updateAddOns,
    updateZipCode,
    clearCheckout,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};