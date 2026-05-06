import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

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
    if (userValue.role === "Super Admin") navigate("/super-admin");
    else if (userValue.role === "Admin") navigate("/admin");
    else if (userValue.role === "Franchise") navigate("/franchise");
    else navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    navigate("/");
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
