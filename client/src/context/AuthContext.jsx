import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, attachToken } from '../lib/api';

const AuthContext = createContext(null);
const storageKey = 'chatspace-auth';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?.token) {
      attachToken(auth.token);
      localStorage.setItem(storageKey, JSON.stringify(auth));
    } else {
      attachToken(null);
      localStorage.removeItem(storageKey);
    }
  }, [auth]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!auth?.token) {
        setLoading(false);
        return;
      }

      try {
        attachToken(auth.token);
        const { data } = await api.get('/auth/me');
        setAuth((current) => ({ ...current, user: data }));
      } catch (error) {
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      auth,
      loading,
      async login(formData) {
        const { data } = await api.post('/auth/login', formData);
        setAuth({ token: data.token, user: data });
      },
      async register(formData) {
        const { data } = await api.post('/auth/register', formData);
        setAuth({ token: data.token, user: data });
      },
      logout() {
        setAuth(null);
      }
    }),
    [auth, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
