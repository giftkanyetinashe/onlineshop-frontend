import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState({
    access_token: null,
    refresh_token: null,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
    if (access_token) {
      try {
        const decoded = jwtDecode(access_token);
        setUser({
          ...decoded,
          is_staff: decoded.is_staff || false  // Ensure is_staff is properly set
        });
        setAuthState({
          access_token,
          refresh_token,
        });
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      } catch (error) {
        console.error('Token decoding error:', error);
      }
    }
    setLoading(false);
  }, []);


  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      const decoded = jwtDecode(access);
      setUser({
        ...decoded,
        is_staff: decoded.is_staff || false  // Ensure is_staff is properly set
      });
      setAuthState({
        access_token: access,
        refresh_token: refresh,
      });
      setIsAuthenticated(true);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setAuthState({
      access_token: null,
      refresh_token: null,
    });
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization'];
  };

  const register = async (userData) => {
    try {
      // Ensure userData includes the password field
      if (!userData.password) {
        throw new Error('Password is required');
      }

      await api.post('/auth/register/', userData);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      authState,
      isAuthenticated, 
      loading, 
      login, 
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
