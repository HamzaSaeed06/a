"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const login = (tokenValue, userValue) => {
    localStorage.setItem("auth_token", tokenValue);
    localStorage.setItem("auth_user", JSON.stringify(userValue));
    setToken(tokenValue);
    setUser(userValue);

    if (userValue.role === "Super Admin") router.push("/super-admin");
    else if (userValue.role === "Admin") router.push("/admin");
    else if (userValue.role === "Franchise") router.push("/franchise");
    else router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
