// hook
import { useContext } from 'react';
import { VendorContext } from './vendorContext';

export const useVendor = () => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within VendorProvider');
  }
  return context;
};