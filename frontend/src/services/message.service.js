import api from './api';
import { encryptData, decryptData } from '../utils/encryption';

const getMessages = async () => {
  const response = await api.get('messages/');
  return response.data;
};

const getMessageById = async (messageId) => {
  const response = await api.get(`messages/${messageId}/`);
  return response.data;
};

const sendMessage = async (recipientId, subject, content) => {
  const response = await api.post('messages/', {
    recipient: recipientId,
    subject,
    content
  });
  return response.data;
};

const sendEncryptedMessage = async (recipientId, subject, content, encryptionKey) => {
  try {
    // Encrypt the message content
    const encryptedContent = await encryptData(content, encryptionKey);
    
    // Send the encrypted message
    const response = await api.post('messages/', {
      recipient: recipientId,
      subject,
      content: encryptedContent,
      encrypted: true,
      encryption_metadata: {
        algorithm: 'AES-256',
        mode: 'CBC'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending encrypted message:', error);
    throw error;
  }
};

const readMessage = async (messageId) => {
  const response = await api.get(`messages/${messageId}/read/`);
  return response.data;
};

const readEncryptedMessage = async (messageId, encryptionKey) => {
  try {
    // Get the encrypted message
    const message = await readMessage(messageId);
    
    // Decrypt the message content
    if (message.encrypted) {
      message.content = await decryptData(message.content, encryptionKey);
    }
    
    return message;
  } catch (error) {
    console.error('Error reading encrypted message:', error);
    throw error;
  }
};

const deleteMessage = async (messageId) => {
  const response = await api.delete(`messages/${messageId}/`);
  return response.data;
};

const markAsRead = async (messageId) => {
  const response = await api.post(`messages/${messageId}/mark-read/`);
  return response.data;
};

const getUnreadCount = async () => {
  const response = await api.get('messages/unread-count/');
  return response.data.count;
};

const MessageService = {
  getMessages,
  getMessageById,
  sendMessage,
  sendEncryptedMessage,
  readMessage,
  readEncryptedMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount
};

export default MessageService;