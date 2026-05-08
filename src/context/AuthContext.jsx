// src/context/AuthContext.jsx - FIXED VERSION
import { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // Verify token is still valid and refresh user data
          try {
            const response = await apiClient.get('/auth/me');
            if (response.data?.user) {
              const freshUser = response.data.user;
              localStorage.setItem('user', JSON.stringify(freshUser));
              setUser(freshUser);
            }
          } catch (err) {
            console.log('Token verification failed, but using cached user');
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userToken');
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    console.log('🔐 Login attempt:', { email });
    
    try {
      const isEmail = email.includes('@');
      const loginData = isEmail 
        ? { email, password }
        : { username: email, password };
      
      console.log('📡 Sending login request to API...');
      const response = await apiClient.post('/auth/login', loginData);
      console.log('✅ Login response:', response.data);
      
      const { user: realUser, token } = response.data;
      
      // Store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(realUser));
      localStorage.setItem('userToken', token);
      setUser(realUser);
      
      console.log('👤 User role:', realUser.role);
      if (realUser.merchant) {
        console.log('🏪 Merchant data:', realUser.merchant);
      }
      
      return { success: true, user: realUser };
      
    } catch (error) {
      console.log('❌ API login failed:', error.message);
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      
      // REMOVED demo fallback - always use real API
      return { 
        success: false, 
        error: error.response?.data?.error || 'Invalid credentials. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;