import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { login as loginApi } from "../services/auth/authService";
import type { LoginRequest, LoginResponse } from "../types/auth";

interface AuthContextType {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<LoginResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    const fullName = localStorage.getItem("userFullName");

    if (token && role && email && fullName) {
      setUser({
        token,
        role: role as LoginResponse["role"],
        email,
        fullName,
      });
    }
  }, []);

  const login = async (
    credentials: LoginRequest
  ): Promise<LoginResponse> => {
    const data = await loginApi(credentials);

    localStorage.setItem("accessToken", data.token);
    localStorage.setItem("userRole", data.role);
    localStorage.setItem("userEmail", data.email);
    localStorage.setItem("userFullName", data.fullName);

    setUser(data);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFullName");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}