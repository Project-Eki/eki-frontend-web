import React from "react";
import { Routes, Route } from "react-router-dom";

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { VendorOnboardingProvider } from "./context/vendorOnboardingContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminSignin from "./pages/AdminLogin"; 
import AccountSettingsPage from "./pages/AccountSetting";
import VendorOnboarding from "./pages/VendorOnboarding";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminManagement from "./pages/AdminManagement";
import ProductDashboard from "./pages/ProductDashboard";
import OrderManagement from "./pages/OrderManagement";
import PaymentSystem from "./pages/PaymentSystem";
import PaymentAndPayout from "./pages/PaymentAndPayout";
import BusinessSettings from "./pages/BusinessSettings";
import OtpVerify from "./pages/otp";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-login" element={<AdminSignin />} />

          {/* Account & Settings */}
          <Route path="/account-settings" element={<AccountSettingsPage />} />
          <Route path="/settings" element={<Settings />} />

          {/* Vendor Onboarding (wrapped in provider) */}
          <Route
            path="/VendorOnboarding"
            element={
              <VendorOnboardingProvider>
                <VendorOnboarding />
              </VendorOnboardingProvider>
            }
          />

          {/* Dashboards */}
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/vendordashboard" element={<VendorDashboard />} />

          {/* Admin Management */}
          <Route path="/admin-management" element={<AdminManagement />} />

          {/* Product & Order */}
          <Route path="/product-dashboard" element={<ProductDashboard />} />
          <Route path="/order-management" element={<OrderManagement />} />

          {/* Payments */}
          <Route path="/payment" element={<PaymentSystem />} />
          <Route path="/admin-payments" element={<PaymentAndPayout />} />
          <Route path="/business-settings" element={<BusinessSettings />} /> 
          <Route path="/otp-verify" element={<OtpVerify />} />

          
          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="p-10 text-center text-red-500">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;