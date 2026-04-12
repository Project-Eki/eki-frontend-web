import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export const VendorContext = createContext();

const serviceCategories = ["beauty","transport","tailoring","airlines","hotels","other"];

export const VendorProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [vendorType, setVendorType]         = useState(null);
  const [businessCategory, setBusinessCategory] = useState(null);
  const [vendorCountry, setVendorCountry]   = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('UGX');
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'vendor') {
      loadVendorData();
    } else {
      setLoading(false);
      setVendorType(null);
      setBusinessCategory(null);
    }
  }, [isAuthenticated, user?.role]);

  const loadVendorData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/accounts/vendor/profile/");
      const data = response.data?.data ?? response.data;

      const country = data?.country || data?.business_country || "";
      if (country) {
        setVendorCountry(country);
        try {
          const { getCurrencySymbol } = await import('../utils/currency');
          setCurrencySymbol(getCurrencySymbol(country));
        } catch {
          setCurrencySymbol(getFallbackCurrency(country));
        }
      }

      let type = data?.vendor_type;
      if (!type && data?.business_category) {
        type = serviceCategories.includes(data.business_category) ? "service" : "product";
      }

      setVendorType(type || "product");
      setBusinessCategory(data?.business_category || "retail");
    } catch (err) {
      console.error("[VendorContext] Failed to load vendor data:", err);
      setError(err.message);
      if (err.response?.status !== 401) {
        setVendorType("product");
        setBusinessCategory("retail");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFallbackCurrency = (country) => {
    const map = {
      uganda: "UGX", kenya: "KES", tanzania: "TZS", rwanda: "RWF",
      ethiopia: "ETB", nigeria: "₦", ghana: "₵", "south africa": "R",
      usa: "$", "united kingdom": "£", germany: "€", france: "€",
      india: "₹", china: "¥", japan: "¥", uae: "AED"
    };
    return map[country?.toLowerCase().trim()] || "UGX";
  };

  return (
    <VendorContext.Provider value={{
      vendorType,
      businessCategory,
      vendorCountry,
      currencySymbol,
      loading,
      error,
      refreshVendorData: loadVendorData,
    }}>
      {children}
    </VendorContext.Provider>
  );
};