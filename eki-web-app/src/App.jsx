import React from "react";
import { VendorOnboardingProvider } from "./context/vendorOnboardingContext";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminSignin from "./pages/AdminSignin";
import AccountSettingsPage from "./pages/AccountSetting";
import VendorOnboarding from "./pages/VendorOnboarding";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminManagement from "./pages/AdminManagement";
// ADD THIS LINE BELOW:
import ProductManagement from "./pages/ProductDashboard"; 

import "./App.css";
import ProductDashboard from "./pages/ProductDashboard";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin-signin" element={<AdminSignin />} />
        <Route path="/account-settings" element={<AccountSettingsPage />} />
        <Route
          path="/VendorOnboarding"
          element={
            <VendorOnboardingProvider>
              <VendorOnboarding />
            </VendorOnboardingProvider>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/vendordashboard" element={<VendorDashboard />} />
        <Route path="/admin-management" element={<AdminManagement />} />
        {/* This now has the correct reference */}
        <Route path="/product-dashboard" element={<ProductDashboard />} />
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
  );
}

export default App;