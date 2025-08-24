import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAuthState, setAuthState, clearAuthState } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  referralCode: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, recaptchaToken?: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
    referralCode?: string;
    recaptchaToken?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      const userData = await response.json();
      setUser(userData);
      // Also update stored auth state
      const { token } = getAuthState();
      if (token) {
        setAuthState({ user: userData, token });
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  useEffect(() => {
    const { user: storedUser, token } = getAuthState();
    if (storedUser && token) {
      setUser(storedUser);
      // Refresh user data from server to get latest balance
      refreshUser();
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, recaptchaToken?: string) => {
    const response = await apiRequest("POST", "/api/auth/login", {
      email,
      password,
      recaptchaToken,
    });

    const data = await response.json();
    setAuthState({ user: data.user, token: data.token });
    setUser(data.user);
    
    // Ensure state is updated before resolving
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
    referralCode?: string;
    recaptchaToken?: string;
  }) => {
    const response = await apiRequest("POST", "/api/auth/register", userData);

    const data = await response.json();
    // Don't set user or token until email is verified
    return data;
  };

  const logout = () => {
    clearAuthState();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
