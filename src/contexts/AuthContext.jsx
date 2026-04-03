import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const data = await api.me();
      if (!sessionStorage.getItem('baselineAppIds')) {
        snapshotKnownApps();
      }
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function snapshotKnownApps() {
    const known = localStorage.getItem('knownAppIds');
    sessionStorage.setItem('baselineAppIds', known || '[]');
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    snapshotKnownApps();
    setUser(data.user);
    return data;
  }

  async function register(body) {
    const data = await api.register(body);
    snapshotKnownApps();
    setUser(data.user);
    return data;
  }

  async function acceptInvite(body) {
    const data = await api.acceptInvite(body);
    snapshotKnownApps();
    setUser(data.user);
    return data;
  }

  async function logout() {
    await api.logout();
    sessionStorage.removeItem('baselineAppIds');
    setUser(null);
  }

  async function refreshUser() {
    try {
      const data = await api.me();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }

  function updateUserWorkspace(workspace) {
    setUser(prev => prev ? { ...prev, workspace } : prev);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, acceptInvite, logout, refreshUser, updateUserWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
