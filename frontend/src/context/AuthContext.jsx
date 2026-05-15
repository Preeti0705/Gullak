import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('fintrack_theme') || 'dark');

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('fintrack_token');
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.user);
          if (response.user.theme) {
            setTheme(response.user.theme);
          }
        } catch (error) {
          console.error('Failed to authenticate:', error);
          localStorage.removeItem('fintrack_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fintrack_theme', theme);
  }, [theme]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      if (response.user.theme) setTheme(response.user.theme);
      toast.success('Welcome back, ' + response.user.name);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const updateUserInfo = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      theme, 
      toggleTheme,
      updateUserInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
