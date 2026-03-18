import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { VendorOnboardingProvider } from "./context/vendorOnboardingContext";

// Pages (Keeping your existing imports)
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminSignin from "./pages/AdminLogin";
// import AccountSettingsPage from "./pages/AccountSetting";
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

import "./App.css";

// --- PROTECTED ROUTE COMPONENT ---
// This checks if the user is logged in and has the right role
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  // 1. Check if authenticated
  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. If a specific role is required, check it
  if (allowedRole && user.role !== allowedRole) {
    // If they are a vendor trying to access admin, or vice versa
    return <Navigate to="/" replace />;
  }

  return children;
};

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

          {/* Vendor Onboarding (wrapped in provider) */}
          <Route
            path="/VendorOnboarding"
            element={
              <VendorOnboardingProvider>
                <VendorOnboarding />
              </VendorOnboardingProvider>
            }
          />

          {/* --- PROTECTED VENDOR ROUTES --- */}
          <Route 
            path="/vendordashboard" 
            element={
              <ProtectedRoute allowedRole="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/product-dashboard" element={<ProtectedRoute allowedRole="vendor"><ProductDashboard /></ProtectedRoute>} />
          <Route path="/order-management" element={<ProtectedRoute allowedRole="vendor"><OrderManagement /></ProtectedRoute>} />
          <Route path="/business-settings" element={<ProtectedRoute allowedRole="vendor"><BusinessSettings /></ProtectedRoute>} />

          {/* --- PROTECTED ADMIN ROUTES --- */}
          <Route 
            path="/admindashboard" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin-management" element={<ProtectedRoute allowedRole="admin"><AdminManagement /></ProtectedRoute>} />
          <Route path="/admin-payments" element={<ProtectedRoute allowedRole="admin"><PaymentAndPayout /></ProtectedRoute>} />

          {/* Shared Protected Routes */}
          {/* <Route path="/account-settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} /> */}
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><PaymentSystem /></ProtectedRoute>} />

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


// import React from "react";
// import { Routes, Route, Navigate  } from "react-router-dom";
// import { useAuth } from "./context/AuthContext";

// // Contexts
// import { AuthProvider } from "./context/AuthContext";
// import { VendorOnboardingProvider } from "./context/vendorOnboardingContext";

// // Pages
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import AdminSignin from "./pages/AdminLogin"; // Correct import name
// import AccountSettingsPage from "./pages/AccountSetting";
// import VendorOnboarding from "./pages/VendorOnboarding";
// import Settings from "./pages/Settings";
// import AdminDashboard from "./pages/AdminDashboard";
// import VendorDashboard from "./pages/VendorDashboard";
// import AdminManagement from "./pages/AdminManagement";
// import ProductDashboard from "./pages/ProductDashboard";
// import OrderManagement from "./pages/OrderManagement";
// import PaymentSystem from "./pages/PaymentSystem";
// import PaymentAndPayout from "./pages/PaymentAndPayout";
// import BusinessSettings  from "./pages/BusinessSettings";


// import "./App.css";

// function App() {
//   return (
//     <AuthProvider>
//       <div className="App">
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password" element={<ResetPassword />} />
//           <Route path="/admin-login" element={<AdminSignin />} />

//           {/* Account & Settings */}
//           <Route path="/account-settings" element={<AccountSettingsPage />} />
//           <Route path="/settings" element={<Settings />} />

//           {/* Vendor Onboarding (wrapped in provider) */}
//           <Route
//             path="/VendorOnboarding"
//             element={
//               <VendorOnboardingProvider>
//                 <VendorOnboarding />
//               </VendorOnboardingProvider>
//             }
//           />

//           {/* Dashboards */}
//           <Route path="/admindashboard" element={<AdminDashboard />} />
//           <Route path="/vendordashboard" element={<VendorDashboard />} />

//           {/* Admin Management */}
//           <Route path="/admin-management" element={<AdminManagement />} />

//           {/* Product & Order */}
//           <Route path="/product-dashboard" element={<ProductDashboard />} />
//           <Route path="/order-management" element={<OrderManagement />} />

//           {/* Payments */}
//           <Route path="/payment" element={<PaymentSystem />} />
//           <Route path="/admin-payments" element={<PaymentAndPayout />} />
//            <Route path="/business-settings" element={<BusinessSettings />} />  
//           {/* 404 Fallback */}
//           <Route
//             path="*"
//             element={
//               <div className="p-10 text-center text-red-500">
//                 404 - Page Not Found
//               </div>
//             }
//           />
//         </Routes>
//       </div>
//     </AuthProvider>
//   );
// }

// export default App;