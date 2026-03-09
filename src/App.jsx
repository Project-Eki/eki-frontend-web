import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../eki-web-app/src/pages/Home';
import SignIn from '../eki-web-app/src/pages/SignIn'; 
import ForgotPassword from '../eki-web-app/src/pages/ForgotPassword';
import ResetPassword from '../eki-web-app/src/pages/ResetPassword';
import AdminSignin from './pages/AdminSignin';
import AccountSettingsPage from './pages/AccountSetting';
import VendorOnboarding from "../eki-web-app/src/pages/VendorOnboarding";
import Settings from '../eki-web-app/src/pages/Settings';
import AdminDashboard from '../eki-web-app/src/pages/AdminDashboard';
import VendorDashboard from '../eki-web-app/src/pages/VendorDashboard';

import './App.css';

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
         <Route path="/VendorOnboarding" element={<VendorOnboarding />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/vendordashboard" element={<VendorDashboard />} />
         <Route path="*" element={<div className="p-10 text-center text-red-500">404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;