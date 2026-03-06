import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, logoutApi, getMe, setAuthToken, getAuthToken } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // null = unknown, false = not logged in, object = logged in
  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(null);

  // On mount, check if we have a stored token and fetch user info
  useEffect(() => {
    (async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          const res = await getMe();
          if (res.data.authenticated) {
            setUser(res.data);
          } else {
            await setAuthToken(null);
            setUser(false);
          }
        } else {
          setUser(false);
        }
      } catch {
        await setAuthToken(null);
        setUser(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await loginApi(username, password);
    // Store auth token returned by backend
    if (res.data.token) {
      await setAuthToken(res.data.token);
    }
    setGuestMode(false);
    setTransitioning('login');
    await new Promise((r) => setTimeout(r, 1200));
    setUser({ ...res.data, authenticated: true });
    setTimeout(() => setTransitioning(null), 400);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    setTransitioning('logout');
    await new Promise((r) => setTimeout(r, 1000));
    try {
      await logoutApi();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      await setAuthToken(null);
      setUser(false);
      setGuestMode(false);
      setTimeout(() => setTransitioning(null), 400);
    }
  }, []);

  const enterGuest = useCallback(() => {
    setGuestMode(true);
  }, []);

  const exitGuest = useCallback(() => {
    setGuestMode(false);
  }, []);

  const isAuthenticated = !!user && user.authenticated === true;
  const isAdmin = isAuthenticated && user.role === 'admin';
  const isGuest = guestMode && !isAuthenticated;

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe();
      if (res.data.authenticated) setUser(res.data);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        transitioning,
        login,
        logout,
        enterGuest,
        exitGuest,
        refreshUser,
        isAuthenticated,
        isAdmin,
        isGuest,
        guestMode,
        role: isAdmin ? 'admin' : 'guest',
        canDelete: isAdmin,
        canExport: isAdmin,
        canScan: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
