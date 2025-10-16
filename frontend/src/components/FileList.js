import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FileService from '../services/file.service';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await FileService.getFiles();
      setFiles(data);
    } catch (err) {
      setError('Failed to fetch files');
      console.error('Error fetching files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await FileService.deleteFile(fileId);
      setFiles(files.filter(file => file.id !== fileId));
    } catch (err) {
      setError('Failed to delete file');
      console.error('Error deleting file:', err);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      await FileService.downloadFile(fileId);
      // In a real implementation, this would trigger a file download
      alert('Download initiated. Check your downloads folder.');
    } catch (err) {
      setError('Failed to download file');
      console.error('Error downloading file:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Files</h2>
        <Link to="/upload" className="btn btn-primary">
          Upload File
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <div className="alert alert-info">
          No files uploaded yet. <Link to="/upload">Upload your first file</Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Encrypted</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.id}>
                  <td>{file.original_name || file.name}</td>
                  <td>{file.file_type}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>
                    {file.encrypted ? (
                      <span className="badge bg-success">Yes</span>
                    ) : (
                      <span className="badge bg-secondary">No</span>
                    )}
                  </td>
                  <td>{formatDate(file.created_at)}</td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleDownload(file.id)}
                        title="Download"
                      >
                        <i className="bi bi-download"></i> Download
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(file.id, file.original_name || file.name)}
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileList;
