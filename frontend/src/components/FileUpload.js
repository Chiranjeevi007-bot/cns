import React, { useState } from 'react';
import FileService from '../services/file.service';
import { generateEncryptionKey } from '../utils/encryption';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError('');
    setSuccess('');

    try {
      if (isEncrypted) {
        // Generate encryption key
        const encryptionKey = await generateEncryptionKey();
        
        // Upload encrypted file
        await FileService.uploadEncryptedFile(file, encryptionKey);
        
        setSuccess(`File "${file.name}" uploaded and encrypted successfully! Save this key to decrypt later: ${encryptionKey}`);
      } else {
        // Regular file upload process
        const fileMetadata = {
          name: file.name,
          original_name: file.name,
          file_type: file.type,
          size: file.size,
          encrypted: false
        };
        
        // Initialize upload
        const initResponse = await FileService.initFileUpload(fileMetadata);
        const fileId = initResponse.file_id;
        
        // Split file into chunks
        const chunks = await FileService.splitFileIntoChunks(file);
        
        // Upload each chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const chunkHash = await FileService.calculateHash(chunk);
          
          await FileService.uploadFileChunk(fileId, i, chunk, chunkHash);
          setProgress(Math.round(((i + 1) / chunks.length) * 100));
        }
        
        // Complete upload
        await FileService.completeFileUpload(fileId);
        
        setSuccess(`File "${file.name}" uploaded successfully!`);
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <h2>Upload File</h2>
      
      <div className="form-group">
        <input 
          type="file" 
          onChange={handleFileChange} 
          disabled={isUploading}
        />
      </div>
      
      <div className="form-group">
        <label>
          <input 
            type="checkbox" 
            checked={isEncrypted} 
            onChange={() => setIsEncrypted(!isEncrypted)}
            disabled={isUploading}
          />
          Encrypt file
        </label>
      </div>
      
      <button 
        onClick={handleUpload} 
        disabled={!file || isUploading}
        className="btn btn-primary"
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
      
      {isUploading && (
        <div className="progress">
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${progress}%` }}
            aria-valuenow={progress} 
            aria-valuemin="0" 
            aria-valuemax="100"
          >
            {progress}%
          </div>
        </div>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
    </div>
  );
};

export default FileUpload;