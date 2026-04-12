import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
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
import ServiceManagement from "./pages/ServiceManagement";
import AdminManagement from "./pages/AdminManagement";
import ProductDashboard from "./pages/ProductDashboard";
import OrderManagement from "./pages/OrderManagement";
import PaymentSystem from "./pages/PaymentSystem";
import PaymentAndPayout from "./pages/PaymentAndPayout";
import BusinessSettings from "./pages/BusinessSettings";
import VendorReviews from "./pages/VendorReview";
import Demo from "./pages/Demo";

// --- THE OTP IMPORT ---
import OtpVerify from "./pages/otp"; 

import "./App.css";

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user.isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public & Auth Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* CRITICAL FIX: Path must be '/otp' to match your ForgotPassword navigate call */}
          <Route path="/otp" element={<OtpVerify />} />
          
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-login" element={<AdminSignin />} />

          {/* Vendor Onboarding */}
          <Route path="/VendorOnboarding" element={
            <VendorOnboardingProvider>
              <VendorOnboarding />
            </VendorOnboardingProvider>
          } />

          {/* Protected Vendor Routes */}
          <Route path="/vendordashboard" element={<ProtectedRoute allowedRole="vendor"><VendorDashboard /></ProtectedRoute>} />
          <Route path="/product-dashboard" element={<ProtectedRoute allowedRole="vendor"><ProductDashboard /></ProtectedRoute>} />
          <Route path="/order-management" element={<ProtectedRoute allowedRole="vendor"><OrderManagement /></ProtectedRoute>} />
          <Route path="/business-settings" element={<BusinessSettings />} />
          {/* <Route path="/servicemanagement" element={<ProtectedRoute allowedRole="vendor"><ServiceManagement /></ProtectedRoute>} /> */}
            <Route path="/servicemanagement" element={<ServiceManagement />} />  
          {/* Protected Admin Routes */}
          <Route path="/admindashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin-management" element={<ProtectedRoute allowedRole="admin"><AdminManagement /></ProtectedRoute>} />
          <Route path="/admin-payments" element={<ProtectedRoute allowedRole="admin"><PaymentAndPayout /></ProtectedRoute>} />

          {/* Shared Protected Routes */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/payment" element={<ProtectedRoute><PaymentSystem /></ProtectedRoute>} />
          <Route path="/account-settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
          <Route path="/vendor-reviews" element={<ProtectedRoute allowedRole="vendor"><VendorReviews /></ProtectedRoute>} />

          {/* 404 Fallback */}
          <Route path="*" element={<div className="p-10 text-center text-red-500 font-bold">404 - Page Not Found</div>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;