import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import VendorOnboarding from "./pages/VendorOnboarding";
import SignIn from './pages/SignIn'; 
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/VendorOnboarding" element={<VendorOnboarding />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/signIn" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<div className="p-10 text-center text-red-500">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;
