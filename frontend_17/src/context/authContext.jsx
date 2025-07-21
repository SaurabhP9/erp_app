import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/api"; // Your axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: "",
    user: null,
    loading: true,
  });

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || !role) {
        setAuth({
          isAuthenticated: false,
          role: "",
          user: null,
          loading: false,
        });
        return;
      }

      try {
        const res = await axios.get("/api/verify-token");
        setAuth({
          isAuthenticated: true,
          role,
          user: res.data.user,
          loading: false,
        });
      } catch (err) {
        localStorage.clear();
        setAuth({
          isAuthenticated: false,
          role: "",
          user: null,
          loading: false,
        });
      }
    };

    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
