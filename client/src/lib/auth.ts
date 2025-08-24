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

interface AuthState {
  user: User | null;
  token: string | null;
}

const AUTH_STORAGE_KEY = "tradepilot_auth";

export function getAuthState(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error parsing auth state:", error);
  }
  return { user: null, token: null };
}

export function setAuthState(state: AuthState) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

export function clearAuthState() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const { token } = getAuthState();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function isAuthenticated(): boolean {
  const { token } = getAuthState();
  return !!token;
}

export function isAdmin(): boolean {
  const { user } = getAuthState();
  return user?.isAdmin ?? false;
}
