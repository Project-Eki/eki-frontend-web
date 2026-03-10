import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn'; 
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
<<<<<<< HEAD
import AdminSignin from './pages/AdminSignin';
import AccountSetting from './pages/AccountSetting';
=======
// import AdminSignin from './pages/AdminSignin';
// import AccountSettingsPage from './pages/AccountSetting';
>>>>>>> 39f0843d9cc5b2916bfdaf41341650369433cc94
import VendorOnboarding from "./pages/VendorOnboarding";
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
<<<<<<< HEAD
import AdminManagement  from './pages/AdminManagement';
=======
>>>>>>> 39f0843d9cc5b2916bfdaf41341650369433cc94

import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
<<<<<<< HEAD
        <Route path="/admin-signin" element={<AdminSignin />} />
        <Route path="/account-settings" element={<AccountSetting />} />
         <Route path="/VendorOnboarding" element={<VendorOnboarding />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/adminmanagement" element={<AdminManagement />} />
=======
        {/* <Route path="/admin-signin" element={<AdminSignin />} /> */}
        {/* <Route path="/account-settings" element={<AccountSettingsPage />} /> */}
         <Route path="/VendorOnboarding" element={<VendorOnboarding />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
>>>>>>> 39f0843d9cc5b2916bfdaf41341650369433cc94
          <Route path="/vendordashboard" element={<VendorDashboard />} />
         <Route path="*" element={<div className="p-10 text-center text-red-500">404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;