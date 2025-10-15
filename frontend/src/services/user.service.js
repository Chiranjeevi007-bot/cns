import api from './api';

const getCurrentUser = async () => {
  const response = await api.get('users/me/');
  return response.data;
};

const getUserById = async (userId) => {
  const response = await api.get(`users/${userId}/`);
  return response.data;
};

const updateUser = async (userData) => {
  const response = await api.put('users/me/', userData);
  return response.data;
};

const updatePassword = async (currentPassword, newPassword) => {
  const response = await api.post('users/change-password/', {
    current_password: currentPassword,
    new_password: newPassword
  });
  return response.data;
};

const generateKeyPair = async (password) => {
  // This would typically use Web Crypto API to generate RSA key pair
  // This is a placeholder for the actual implementation
  return {
    publicKey: 'placeholder-public-key',
    privateKey: 'placeholder-private-key-encrypted-with-password'
  };
};

const verifyKey = async (userId, publicKey) => {
  const response = await api.post(`users/${userId}/verify-key/`, {
    public_key: publicKey
  });
  return response.data;
};

const getUserPublicKey = async (userId) => {
  const response = await api.get(`users/${userId}/public-key/`);
  return response.data.public_key;
};

const UserService = {
  getCurrentUser,
  getUserById,
  updateUser,
  updatePassword,
  generateKeyPair,
  verifyKey,
  getUserPublicKey
};

export default UserService;