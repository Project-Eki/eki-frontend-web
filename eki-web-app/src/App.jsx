import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { VendorOnboardingProvider } from "./context/vendorOnboardingContext";
import { VendorProvider } from "./context/vendorContext";

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
import AdminBuyerManagement from "./pages/AdminBuyerManagement";
import AdminProductsManagement from "./pages/AdminProductsManagement";
// import AdminServicesManagement from "./pages/AdminServicesManagement";
import ProductDashboard from "./pages/ProductDashboard";
import OrderManagement from "./pages/OrderManagement";
import PaymentSystem from "./pages/PaymentSystem";
import PaymentAndPayout from "./pages/PaymentAndPayout";
import BusinessSettings from "./pages/BusinessSettings";
import VendorReviews from "./pages/VendorReview";
import Demo from "./pages/Demo";
import VendorChat from "./pages/VendorChatpage";     
import AdminTransactions from "./pages/AdminTransactions";
import AdminWalletTransactions from "./pages/AdminWalletTransactions";
import AdminWithdrawals from "./pages/AdminWithdrawals";


// --- THE OTP IMPORT ---
import OtpVerify from "./pages/otp";

import "./App.css";

// --- PROTECTED ROUTE — reads directly from localStorage as fallback ---
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  // Fall back to localStorage in case context hasn't settled yet
  const isAuthenticated =
    user.isAuthenticated ||
    (!!localStorage.getItem("access_token") &&
      !!(
        localStorage.getItem("userRole") || localStorage.getItem("vendor_role")
      ));

  const role =
    user.role ||
    localStorage.getItem("userRole") ||
    localStorage.getItem("vendor_role");

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

// --- VENDOR LAYOUT — wraps VendorProvider around vendor-only routes ---
// This prevents VendorProvider from running on public pages like /login
const VendorLayout = ({ children }) => (
  <VendorProvider>{children}</VendorProvider>
);

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public & Auth Routes — NO VendorProvider here */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp" element={<OtpVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-login" element={<AdminSignin />} />

          {/* Vendor Onboarding */}
          <Route
            path="/VendorOnboarding"
            element={
              <VendorOnboardingProvider>
                <VendorOnboarding />
              </VendorOnboardingProvider>
            }
          />

          {/* Protected Vendor Routes — VendorProvider scoped here only */}
          <Route
            path="/vendordashboard"
            element={
              <ProtectedRoute allowedRole="vendor">
                <VendorLayout>
                  <VendorDashboard />
                </VendorLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/product-dashboard"
            element={
              <ProtectedRoute allowedRole="vendor">
                <VendorLayout>
                  <ProductDashboard />
                </VendorLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/order-management" element={
            <ProtectedRoute allowedRole="vendor">
              <VendorLayout><OrderManagement /></VendorLayout>
            </ProtectedRoute>
          } />
          <Route path="/vendor-chat" element={
            <ProtectedRoute allowedRole="vendor">
              <VendorLayout><VendorChat /></VendorLayout>
            </ProtectedRoute>
          } />

          <Route
            path="/business-settings"
            element={
              <ProtectedRoute allowedRole="vendor">
                <VendorLayout>
                  <BusinessSettings />
                </VendorLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/services"
            element={
              <ProtectedRoute allowedRole="vendor">
                <VendorLayout>
                  <ServiceManagement />
                </VendorLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-management"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminManagement />
              </ProtectedRoute>
            }
          />

           <Route
            path="/admin-buyer-management"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminBuyerManagement />
              </ProtectedRoute>
            }
          />

          
           <Route
            path="/admin-products-management"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminProductsManagement />
              </ProtectedRoute>
            }
          />

          
           {/* <Route
            path="/admin-services-management"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminServicesManagement />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/admin-payments"
            element={
              <ProtectedRoute allowedRole="admin">
                <PaymentAndPayout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-transactions"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminTransactions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-wallet-transactions"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminWalletTransactions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-withdrawals"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminWithdrawals />
              </ProtectedRoute>
            }
          />

          {/* Shared Protected Routes */}
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentSystem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account-settings"
            element={
              <ProtectedRoute>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor-reviews"
            element={
              <ProtectedRoute allowedRole="vendor">
                <VendorReviews />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="p-10 text-center text-red-500 font-bold">
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
