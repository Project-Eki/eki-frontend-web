import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import SignInPage from "./pages/SignIn";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword"; 

function App() {
  const navigate = useNavigate();

  
  const goToSignUp = () => navigate("/signup");
  const goToForgotPassword = () => navigate("/forgot-password");
  const goToSignIn = () => navigate("/signin");
  
 
  const handleSignIn = (data) => {
    console.log("Signing in with:", data);
   
  };

  return (
    <Routes>

      <Route 
        path="/" 
        element={
          <SignInPage 
            onSignUpClick={goToSignUp}
            onForgotPasswordClick={goToForgotPassword}
            onSignIn={handleSignIn}
          />
        } 
      />
      <Route 
        path="/signin" 
        element={
          <SignInPage 
            onSignUpClick={goToSignUp}
            onForgotPasswordClick={goToForgotPassword}
            onSignIn={handleSignIn}
          />
        } 
      />

      
      <Route 
        path="/forgot-password" 
        element={
          <ForgotPasswordPage 
            onBackToLogin={goToSignIn}
          />
        } 
      />
      
      
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}

export default App;