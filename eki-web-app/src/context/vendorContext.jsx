import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

export const VendorContext = createContext();

export const VendorProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [vendorType, setVendorType] = useState(null);
  const [allowedListingTypes, setAllowedListingTypes] = useState([]);
  const [businessCategory, setBusinessCategory] = useState(null);
  const [vendorCountry, setVendorCountry] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("UGX");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === "vendor") {
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
      const response = await api.get("/accounts/vendor/command-center/");
      const data = response.data?.data ?? response.data;

      console.log("[VendorContext] API Response:", data); // Debug log

      const country = data?.country || data?.business_country || "";
      if (country) {
        setVendorCountry(country);
        try {
          const { getCurrencySymbol } = await import("../utils/currency");
          setCurrencySymbol(getCurrencySymbol(country));
        } catch {
          setCurrencySymbol(getFallbackCurrency(country));
        }
      }

      const type = data?.vendor_type; // 'product', 'service', or 'both'
      const allowedTypes = data?.allowed_listing_types || []; // ['product'], ['service'], or ['product', 'service']

      console.log("[VendorContext] vendor_type:", type);
      console.log("[VendorContext] allowed_listing_types:", allowedTypes);

      setVendorType(type || "product");
      setAllowedListingTypes(allowedTypes);
      setBusinessCategory(data?.business_category || "retail");
    } catch (err) {
      console.error("[VendorContext] Failed to load vendor data:", err);
      setError(err.message);
      // Fallback to product type if error
      if (err.response?.status !== 401) {
        setVendorType("product");
        setAllowedListingTypes(["product"]);
        setBusinessCategory("retail");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFallbackCurrency = (country) => {
    const map = {
      uganda: "UGX",
      kenya: "KES",
      tanzania: "TZS",
      rwanda: "RWF",
      ethiopia: "ETB",
      nigeria: "₦",
      ghana: "₵",
      "south africa": "R",
      usa: "$",
      "united kingdom": "£",
      germany: "€",
      france: "€",
      india: "₹",
      china: "¥",
      japan: "¥",
      uae: "AED",
    };
    return map[country?.toLowerCase().trim()] || "UGX";
  };

  return (
    <VendorContext.Provider
      value={{
        vendorType,
        allowedListingTypes,
        businessCategory,
        vendorCountry,
        currencySymbol,
        loading,
        error,
        refreshVendorData: loadVendorData,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};
