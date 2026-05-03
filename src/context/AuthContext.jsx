// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('🔐 Login attempt:', { email });
    
    try {
      const isEmail = email.includes('@');
      const loginData = isEmail 
        ? { email, password }
        : { username: email, password };
      
      console.log('📡 Sending login request...');
      const response = await apiClient.post('/auth/login', loginData);
      console.log('✅ Login response:', response.data);
      
      const { user: realUser, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(realUser));
      localStorage.setItem('userToken', token);
      setUser(realUser);
      
      return { success: true, user: realUser };
    } catch (error) {
      console.log('❌ API login failed:', error.message);
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      
      // If API fails (like password mismatch), try the demo credentials
      const demoCredentials = {
        'admin@qine.com': { password: 'admin123', role: 'ADMIN', firstName: 'Admin' },
        'merchant@qine.com': { password: 'merchant123', role: 'MERCHANT', firstName: 'Merchant' },
        'rider@qine.com': { password: 'rider123', role: 'RIDER', firstName: 'Rider' },
      };
      
      const demo = demoCredentials[email];
      if (demo && password === demo.password) {
        console.log('⚠️ Using demo login fallback');
        
        // Try to find the user in the database by email
        let userId = Date.now().toString();
        try {
          const searchResponse = await apiClient.get(`/users/search/${email}`);
          if (searchResponse.data && searchResponse.data.length > 0) {
            userId = searchResponse.data[0].id;
          }
        } catch (e) {
          console.log('Could not find user in database, using temp ID');
        }
        
        const userData = {
          id: userId,
          email,
          firstName: demo.firstName,
          lastName: 'User',
          role: demo.role,
          status: 'ACTIVE',
        };
        
        const mockToken = 'mock-token-' + userData.id;
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userToken', mockToken);
        setUser(userData);
        
        return { success: true, user: userData };
      }
      
      // If not a demo account and API failed, return error
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