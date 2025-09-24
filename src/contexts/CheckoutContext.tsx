import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CheckoutState {
  boxType: 'subscription' | 'one-time';
  boxSize: 'small' | 'medium' | 'large' | 'protein-pack' | 'full_farm_bag' | 'veggie_bag';
  selectedItems: Record<string, number>;
  addOns: Record<string, number>; // Changed to Record<string, number> for quantities
  proteinSelections: string[]; // Array of selected protein IDs
  carbSelections: string[]; // Array of selected carb IDs
  fullFarmBagSelections: { protein?: string; carb?: string }; // Full farm bag selections
  comments: string; // Comments/requests for Billy & Ana
  zipCode: string;
  deliveryDay: string;
  deliveryMethod: 'delivery' | 'market-pickup' | 'farm-pickup';
}

interface CheckoutContextType {
  checkoutState: CheckoutState;
  updateBoxType: (type: 'subscription' | 'one-time') => void;
  updateBoxSize: (size: 'small' | 'medium' | 'large' | 'protein-pack' | 'full_farm_bag' | 'veggie_bag') => void;
  updateSelectedItems: (items: Record<string, number>) => void;
  updateAddOns: (addOns: Record<string, number>) => void; // Updated type
  updateProteinSelections: (proteins: string[]) => void;
  updateCarbSelections: (carbs: string[]) => void;
  updateFullFarmBagSelections: (selections: { protein?: string; carb?: string }) => void;
  updateComments: (comments: string) => void;
  updateZipCode: (zipCode: string) => void;
  updateDeliveryDay: (deliveryDay: string) => void;
  updateDeliveryMethod: (method: 'delivery' | 'market-pickup' | 'farm-pickup') => void;
  clearCheckout: () => void;
}

const initialState: CheckoutState = {
  boxType: 'subscription',
  boxSize: 'full_farm_bag', // Use the most popular box as default
  selectedItems: {},
  addOns: {}, // Changed to empty object
  proteinSelections: [], // Empty array for protein selections
  carbSelections: [], // Empty array for carb selections
  fullFarmBagSelections: {}, // Empty object for full farm bag selections
  comments: '', // Empty string for comments
  zipCode: '',
  deliveryDay: '',
  deliveryMethod: 'delivery',
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

  const updateBoxSize = (size: 'small' | 'medium' | 'large' | 'protein-pack' | 'full_farm_bag' | 'veggie_bag') => {
    setCheckoutState(prev => ({ ...prev, boxSize: size }));
  };

  const updateSelectedItems = (items: Record<string, number>) => {
    setCheckoutState(prev => ({ ...prev, selectedItems: items }));
  };

  const updateAddOns = (addOns: Record<string, number>) => {
    setCheckoutState(prev => ({ ...prev, addOns }));
  };

  const updateProteinSelections = (proteins: string[]) => {
    setCheckoutState(prev => ({ ...prev, proteinSelections: proteins }));
  };

  const updateCarbSelections = (carbs: string[]) => {
    setCheckoutState(prev => ({ ...prev, carbSelections: carbs }));
  };

  const updateFullFarmBagSelections = (selections: { protein?: string; carb?: string }) => {
    setCheckoutState(prev => ({ ...prev, fullFarmBagSelections: selections }));
  };

  const updateComments = (comments: string) => {
    setCheckoutState(prev => ({ ...prev, comments }));
  };

  const updateZipCode = (zipCode: string) => {
    setCheckoutState(prev => ({ ...prev, zipCode }));
  };

  const updateDeliveryDay = (deliveryDay: string) => {
    setCheckoutState(prev => ({ ...prev, deliveryDay }));
  };

  const updateDeliveryMethod = (method: 'delivery' | 'market-pickup' | 'farm-pickup') => {
    setCheckoutState(prev => ({ ...prev, deliveryMethod: method }));
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
    updateProteinSelections,
    updateCarbSelections,
    updateFullFarmBagSelections,
    updateComments,
    updateZipCode,
    updateDeliveryDay,
    updateDeliveryMethod,
    clearCheckout,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};