import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, logoutApi, getMe } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(null); // 'login' | 'logout' | null

  useEffect(() => {
    getMe()
      .then((res) => {
        if (res.data.authenticated) {
          setUser(res.data);
        } else {
          setUser(false);
        }
      })
      .catch(() => setUser(false))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await loginApi(username, password);
    setTransitioning('login');
    await new Promise((r) => setTimeout(r, 1800));
    setUser({ ...res.data, authenticated: true });
    setTimeout(() => setTransitioning(null), 600);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    setTransitioning('logout');
    await new Promise((r) => setTimeout(r, 1400));
    try {
      await logoutApi();
    } catch (err) {
      console.warn('Logout API call failed, clearing session locally:', err);
    } finally {
      setUser(false);
      setTimeout(() => setTransitioning(null), 600);
    }
  }, []);

  const isAuthenticated = !!user && user.authenticated;
  const isAdmin = isAuthenticated && user.role === 'admin';
  const isGuest = !isAuthenticated;
  const role = isAdmin ? 'admin' : 'guest';
  const canDelete = isAdmin;
  const canExport = isAdmin;
  const canScan = true;

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe();
      if (res.data.authenticated) setUser(res.data);
    } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      transitioning,
      login,
      logout,
      refreshUser,
      isAuthenticated,
      isAdmin,
      isGuest,
      role,
      canDelete,
      canExport,
      canScan,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
