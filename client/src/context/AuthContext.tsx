import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api';
import { clearToken, getToken, setToken } from '../auth';

interface AuthContextType {
  authenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .checkAuth()
      .then(() => setAuthenticated(true))
      .catch(() => {
        clearToken();
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const { token } = await api.login(username, password);
    setToken(token);
    setAuthenticated(true);
  };

  const logout = () => {
    api.logout().catch(() => {});
    clearToken();
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
