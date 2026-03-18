import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    token: localStorage.getItem("access_token") || null,
    role: localStorage.getItem("userRole") || null,
    isAuthenticated: !!localStorage.getItem("access_token"),
  });

  //  Login function
  const login = (token, role) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("userRole", role);

    setUser({
      token,
      role,
      isAuthenticated: true,
    });
  };

  //  Logout function
  const logout = () => {
    localStorage.removeItem("access_token");
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

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};