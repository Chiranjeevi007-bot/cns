import api from './api';

const register = async (username, email, password) => {
  const response = await api.post('users/register/', {
    username,
    email,
    password
  });
  return response.data;
};

const login = async (username, password) => {
  const response = await api.post('users/token/', {
    username,
    password
  });
  
  if (response.data.access) {
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
  }
  
  return response.data;
};

const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    return Promise.reject('No refresh token available');
  }
  
  const response = await api.post('users/token/refresh/', {
    refresh: refreshToken
  });
  
  if (response.data.access) {
    localStorage.setItem('access_token', response.data.access);
  }
  
  return response.data;
};

const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

const AuthService = {
  register,
  login,
  logout,
  refreshToken,
  isAuthenticated
};

export default AuthService;