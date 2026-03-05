import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn'; 
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminSignIn from './pages/adminSignin'; 
import AccountSettingsPage from './pages/accountSetting';
import VendorOnboarding from "./pages/VendorOnboarding";

import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin-signin" element={<adminSignIn />} />
        <Route path="/account-settings" element={<accountSettingsPage />} />
         <Route path="/VendorOnboarding" element={<VendorOnboarding />} />
         <Route path="*" element={<div className="p-10 text-center text-red-500">404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;