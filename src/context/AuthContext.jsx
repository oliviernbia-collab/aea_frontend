import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

const BUREAU_ROLES = [
  'super_admin', 'president', 'vice_president', 'secretaire_general', 'tresorier', 'resp_communication',
  'secretaire_organisation', 'secretaire_academique', 'secretaire_culturel', 'commissaire_comptes',
  'secretaire_ideologique', 'secretaire_social', 'secretaire_insertion',
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aea_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const chargerPermissions = useCallback(async () => {
    try {
      const { data } = await api.get('/permissions/mine');
      setPermissions(data.permissions || {});
    } catch (err) {
      setPermissions({});
    }
  }, []);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('aea_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/moi');
      setUser(data);
      localStorage.setItem('aea_user', JSON.stringify(data));
      connectSocket();
      await chargerPermissions();
    } catch (err) {
      localStorage.removeItem('aea_token');
      localStorage.removeItem('aea_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [chargerPermissions]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (identifiant, password) => {
    const { data } = await api.post('/auth/connexion', { identifiant, password });
    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true, tempToken: data.tempToken };
    }
    localStorage.setItem('aea_token', data.token);
    localStorage.setItem('aea_user', JSON.stringify(data.user));
    setUser(data.user);
    connectSocket();
    await chargerPermissions();
    return { user: data.user };
  };

  const verifierCodeDeuxFA = async (tempToken, code) => {
    const { data } = await api.post('/auth/2fa/verifier', { tempToken, code });
    localStorage.setItem('aea_token', data.token);
    localStorage.setItem('aea_user', JSON.stringify(data.user));
    setUser(data.user);
    connectSocket();
    await chargerPermissions();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('aea_token');
    localStorage.removeItem('aea_user');
    setUser(null);
    setPermissions({});
    disconnectSocket();
  };

  const isBureau = user ? BUREAU_ROLES.includes(user.role) : false;
  const hasPermission = useCallback((key) => !!permissions[key], [permissions]);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, verifierCodeDeuxFA, logout, refresh, isBureau, permissions, hasPermission, rechargerPermissions: chargerPermissions }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit etre utilise dans un AuthProvider.');
  return ctx;
}
