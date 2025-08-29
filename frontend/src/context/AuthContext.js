// src/context/AuthContext.js

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
//import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState({
    access_token: localStorage.getItem('access_token'), // Load initial token from storage
    refresh_token: localStorage.getItem('refresh_token'),
  });
  // The loading state is crucial. It's true until we've tried to fetch the user.
  const [loading, setLoading] = useState(true);

  // --- THIS IS THE CRITICAL FIX ---
  // This effect runs once on app load to fetch the full user profile if a token exists.
  const fetchUserDetails = useCallback(async () => {
    const token = authState.access_token;
    if (token) {
      try {
        // Set the Authorization header for this and all future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Make the API call to get the complete user profile
        const response = await api.get('/auth/me/');
        setUser(response.data); // Store the full user object
      } catch (error) {
        console.error("Failed to fetch user details. Token may be expired.", error);
        // If the token is invalid, log the user out completely.
        logout();
      }
    }
    setLoading(false); // We are done loading, whether we found a user or not.
  }, [authState.access_token]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Update the auth state, which will trigger the useEffect to fetch user details
      setAuthState({ access_token: access, refresh_token: refresh });
      
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
    setAuthState({ access_token: null, refresh_token: null });
    delete api.defaults.headers.common['Authorization'];
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register/', userData);
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      // Pass on the error message from the backend if it exists
      throw new Error(error.response?.data?.username?.[0] || 'Registration failed');
    }
  };
  
  // A function for the profile page to update the user object after a successful edit
  const updateUser = useCallback((updatedUserData) => {
      setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, // isAuthenticated is now derived directly from the user object
      loading, 
      login, 
      logout, 
      register,
      updateUser, // Provide the updateUser function
    }}>
      {/* --- This prevents child components from rendering before auth state is determined --- */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);