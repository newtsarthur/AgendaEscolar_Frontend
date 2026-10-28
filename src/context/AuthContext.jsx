import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = useCallback(({ access_token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, access_token);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(
    async (email, password) => handleAuth((await api.post('/auth/login', { email, password })).data),
    [handleAuth],
  );

  const register = useCallback(async (payload) => handleAuth((await api.post('/auth/register', payload)).data), [handleAuth]);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.put('/auth/me', payload);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
