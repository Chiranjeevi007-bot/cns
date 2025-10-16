import api from './api';
import { encryptData, decryptData } from '../utils/encryption';

const getFiles = async () => {
  const response = await api.get('files/');
  return response.data;
};

const getFileById = async (fileId) => {
  const response = await api.get(`files/${fileId}/`);
  return response.data;
};

const initFileUpload = async (fileMetadata) => {
  const response = await api.post('files/upload/init/', fileMetadata);
  return response.data;
};

const uploadFileChunk = async (fileId, chunkIndex, chunkData, chunkHash) => {
  const formData = new FormData();
  formData.append('file_id', fileId);
  formData.append('chunk_index', chunkIndex);
  formData.append('chunk_data', chunkData);
  formData.append('chunk_hash', chunkHash);
  
  const response = await api.post('files/upload/chunk/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const completeFileUpload = async (fileId) => {
  const response = await api.post('files/upload/complete/', { file_id: fileId });
  return response.data;
};

const downloadFile = async (fileId) => {
  const response = await api.get(`files/${fileId}/download/`);
  return response.data;
};

const shareFile = async (fileId, recipientId, accessKey) => {
  const response = await api.post(`files/${fileId}/share/`, {
    shared_with: recipientId,
    access_key: accessKey
  });
  return response.data;
};

const getSharedFiles = async () => {
  const response = await api.get('files/shared/');
  return response.data;
};

const getSharedFileDetails = async (shareId) => {
  const response = await api.get(`files/shared/${shareId}/`);
  return response.data;
};

const deleteFile = async (fileId) => {
  const response = await api.delete(`files/${fileId}/`);
  return response.data;
};

// Client-side encryption helpers
const uploadEncryptedFile = async (file, encryptionKey) => {
  try {
    // Generate file metadata
    const fileMetadata = {
      name: file.name,
      original_name: file.name,
      file_type: file.type,
      size: file.size,
      encrypted: true,
      encryption_metadata: {
        algorithm: 'AES-256',
        mode: 'CBC'
      }
    };
    
    // Initialize upload
    const initResponse = await initFileUpload(fileMetadata);
    const fileId = initResponse.file_id;
    
    // Split file into chunks
    const chunks = await splitFileIntoChunks(file);
    
    // Encrypt and upload each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Encrypt chunk
      const encryptedChunk = await encryptData(chunk, encryptionKey);
      
      // Calculate hash of encrypted chunk
      const chunkHash = await calculateHash(encryptedChunk);
      
      // Upload chunk
      await uploadFileChunk(fileId, i, encryptedChunk, chunkHash);
    }
    
    // Complete upload
    const completeResponse = await completeFileUpload(fileId);
    return completeResponse;
  } catch (error) {
    console.error('Error uploading encrypted file:', error);
    throw error;
  }
};

const downloadEncryptedFile = async (fileId, encryptionKey) => {
  try {
    // Get file download information
    const downloadInfo = await downloadFile(fileId);
    
    // Download and decrypt each chunk
    const chunks = [];
    for (let i = 0; i < downloadInfo.chunks_count; i++) {
      // Download chunk
      const chunkResponse = await api.get(`files/${fileId}/chunk/${i}/`);
      const encryptedChunk = chunkResponse.data;
      
      // Verify chunk hash
      const chunkHash = await calculateHash(encryptedChunk);
      if (chunkHash !== downloadInfo.chunks_hashes[i]) {
        throw new Error(`Chunk integrity check failed for chunk ${i}`);
      }
      
      // Decrypt chunk
      const decryptedChunk = await decryptData(encryptedChunk, encryptionKey);
      chunks.push(decryptedChunk);
    }
    
    // Combine chunks into a single file
    const fileBlob = await combineChunks(chunks, downloadInfo.file_type);
    return {
      blob: fileBlob,
      fileName: downloadInfo.original_name,
      fileType: downloadInfo.file_type
    };
  } catch (error) {
    console.error('Error downloading encrypted file:', error);
    throw error;
  }
};

// Helper functions
// TODO: These functions implement basic file chunking. For production:
// 1. Add progress callbacks for upload/download tracking
// 2. Implement chunk retry logic for failed uploads
// 3. Add parallel chunk uploads with concurrency control
// 4. Implement proper error handling and cleanup on failure
const splitFileIntoChunks = async (file, chunkSize = 1024 * 1024) => {
  return new Promise((resolve) => {
    const chunks = [];
    const reader = new FileReader();
    let offset = 0;
    
    const readNextChunk = () => {
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    
    reader.onload = (e) => {
      chunks.push(e.target.result);
      offset += chunkSize;
      
      if (offset < file.size) {
        readNextChunk();
      } else {
        resolve(chunks);
      }
    };
    
    readNextChunk();
  });
};

const combineChunks = async (chunks, fileType) => {
  const blob = new Blob(chunks, { type: fileType });
  return blob;
};

// TODO: Implement actual hash calculation using Web Crypto API
// This is critical for file integrity verification and audit trails
// See encryption.js hashData() function for implementation details
const calculateHash = async (data) => {
  // Placeholder for actual hash calculation
  // In a real implementation, use Web Crypto API for SHA-256 or similar
  return 'hash-placeholder';
};

const FileService = {
  getFiles,
  getFileById,
  initFileUpload,
  uploadFileChunk,
  completeFileUpload,
  downloadFile,
  shareFile,
  getSharedFiles,
  getSharedFileDetails,
  deleteFile,
  uploadEncryptedFile,
  downloadEncryptedFile,
  // Export helper functions for use in components
  splitFileIntoChunks,
  calculateHash
};

export default FileService;