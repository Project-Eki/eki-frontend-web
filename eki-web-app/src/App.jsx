import { Routes, Route } from "react-router-dom";
// import Signup from "./pages/Signup";
import VendorOnboarding from "./pages/VendorOnboarding";

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<h1>Landing Page (team member working here)</h1>} /> */}
      {/* <Route path="/signup" element={<Signup />} /> */}
      <Route path="/VendorOnboarding" element={<VendorOnboarding />} />
      <Route path="*" element={<div className="p-10 text-center text-red-500">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;