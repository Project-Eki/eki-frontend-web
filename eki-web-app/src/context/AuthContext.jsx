import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    token: localStorage.getItem("access_token") || null,
    role: localStorage.getItem("userRole") || null,
    isAuthenticated: !!localStorage.getItem("access_token"),
  });

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