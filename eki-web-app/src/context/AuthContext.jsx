import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // const [user, setUser] = useState({
  //   token: localStorage.getItem("access_token") || null,
  //   role: localStorage.getItem("userRole") || null,
  //   isAuthenticated: !!localStorage.getItem("access_token"),
  // });
  // In AuthContext.js
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("userRole");
    return {
      token: token || null,
      role: role || null,
      isAuthenticated: !!token, // If token exists, true; else false
    };
  });

  // AUTO-LOGIN VERIFICATION
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        // Optional: You could call a /me or /profile endpoint here 
        // to verify the token is still valid with the backend.
        console.log("Auto-login: Token found for role:", user.role);
      }
    };
    checkAuth();
  }, [user.role]);

  // Login function - now accepting refreshToken
  const login = (accessToken, role, refreshToken = null) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("userRole", role.toLowerCase());
    
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }

    setUser({
      token: accessToken,
      role: role.toLowerCase(),
      isAuthenticated: true,
    });
  };

  // Logout function - clears everything
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token"); // Clean up refresh token too
    localStorage.removeItem("userRole");

    setUser({
      token: null,
      role: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};