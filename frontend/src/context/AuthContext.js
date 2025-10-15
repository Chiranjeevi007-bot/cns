import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          // Check if token is expired
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired, try to refresh
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              try {
                const response = await authService.refreshToken(refreshToken);
                localStorage.setItem('access_token', response.access);
                
                // Get user profile
                const userProfile = await authService.getUserProfile();
                setCurrentUser(userProfile);
                setIsAuthenticated(true);
              } catch (error) {
                // Refresh failed, logout
                logout();
              }
            } else {
              // No refresh token, logout
              logout();
            }
          } else {
            // Token valid, get user profile
            try {
              const userProfile = await authService.getUserProfile();
              setCurrentUser(userProfile);
              setIsAuthenticated(true);
            } catch (error) {
              logout();
            }
          }
        } catch (error) {
          // Invalid token, logout
          logout();
        }
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      const userProfile = await authService.getUserProfile();
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      
      return userProfile;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authService.register(username, email, password);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const updateUserProfile = (updatedProfile) => {
    setCurrentUser({ ...currentUser, ...updatedProfile });
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};