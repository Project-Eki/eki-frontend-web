import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access_token");
    const role =
      localStorage.getItem("userRole") ||
      localStorage.getItem("vendor_role") ||   // ← teammate's key
      null;
    return {
      token: token || null,
      role: role || null,
      isAuthenticated: !!token && !!role,       // ← BOTH must exist
    };
  });

  const login = (accessToken, role, refreshToken = null) => {
    const normalizedRole = role.toLowerCase();
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("userRole", normalizedRole);      // for AuthContext
    localStorage.setItem("vendor_role", normalizedRole);   // for authService
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

    setUser({
      token: accessToken,
      role: normalizedRole,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("vendor_role");
    setUser({ token: null, role: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: user.isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};