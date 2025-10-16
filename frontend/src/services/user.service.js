import api from './api';

const getProfile = async () => {
  const response = await api.get('users/profile/');
  return response.data;
};

const updateProfile = async (userData) => {
  const response = await api.put('users/profile/', userData);
  return response.data;
};

const getUserKeys = async () => {
  const response = await api.get('users/keys/');
  return response.data;
};

const uploadKey = async (keyData) => {
  const response = await api.post('users/keys/', keyData);
  return response.data;
};

const verifyKey = async () => {
  const response = await api.post('users/keys/verify/');
  return response.data;
};

const getUserById = async (userId) => {
  const response = await api.get(`users/${userId}/`);
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

const getUserPublicKey = async (userId) => {
  const response = await api.get(`users/${userId}/public-key/`);
  return response.data.public_key;
};

const UserService = {
  getProfile,
  updateProfile,
  getUserKeys,
  uploadKey,
  verifyKey,
  getUserById,
  updatePassword,
  generateKeyPair,
  getUserPublicKey
};

export default UserService;