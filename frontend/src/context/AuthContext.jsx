import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('bloodDonorUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('bloodDonorUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('bloodDonorUser', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password, role) => {
    const { data } = await axiosInstance.post('/auth/register', { name, email, password, role });
    setUser(data);
    localStorage.setItem('bloodDonorUser', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bloodDonorUser');
  };

  const updateUser = (updates) => {
    if (!user || Object.entries(updates).every(([key, value]) => user[key] === value)) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('bloodDonorUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
