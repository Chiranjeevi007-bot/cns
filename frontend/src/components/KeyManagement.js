import React, { useState, useEffect } from 'react';
import UserService from '../services/user.service';
import { generateEncryptionKey } from '../utils/encryption';

const KeyManagement = () => {
  const [userKey, setUserKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newKey, setNewKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchUserKey();
  }, []);

  const fetchUserKey = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await UserService.getUserKeys();
      setUserKey(data);
    } catch (err) {
      if (err.response?.status === 404) {
        // No key found, that's okay
        setUserKey(null);
      } else {
        setError('Failed to fetch encryption keys');
        console.error('Error fetching keys:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const key = await generateEncryptionKey();
      setNewKey(key);
      setSuccess('New encryption key generated! Please save it securely.');
    } catch (err) {
      setError('Failed to generate key');
      console.error('Error generating key:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadKey = async () => {
    if (!newKey) {
      setError('Please generate or enter a key first');
      return;
    }

    setError('');
    setSuccess('');

    try {
      // In a real implementation, this would calculate the actual fingerprint
      const fingerprint = newKey.substring(0, 16) + '...';
      
      await UserService.uploadKey({
        public_key: newKey,
        key_fingerprint: fingerprint
      });
      
      setSuccess('Encryption key uploaded successfully');
      await fetchUserKey();
      setNewKey('');
    } catch (err) {
      setError('Failed to upload key');
      console.error('Error uploading key:', err);
    }
  };

  const handleVerifyKey = async () => {
    setError('');
    setSuccess('');

    try {
      await UserService.verifyKey();
      setSuccess('Key verified successfully');
      await fetchUserKey();
    } catch (err) {
      setError('Failed to verify key');
      console.error('Error verifying key:', err);
    }
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
    <div className="key-management">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <h2 className="mb-4">Encryption Key Management</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          {/* Current Key Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Current Encryption Key</h5>
            </div>
            <div className="card-body">
              {userKey ? (
                <div>
                  <div className="mb-3">
                    <h6 className="text-muted">Key Fingerprint</h6>
                    <p className="font-monospace">{userKey.key_fingerprint}</p>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted">Status</h6>
                    <p>
                      {userKey.verified_at ? (
                        <span className="badge bg-success">Verified</span>
                      ) : (
                        <span className="badge bg-warning">Not Verified</span>
                      )}
                    </p>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted">Created</h6>
                    <p>{formatDate(userKey.created_at)}</p>
                  </div>

                  {userKey.verified_at && (
                    <div className="mb-3">
                      <h6 className="text-muted">Verified</h6>
                      <p>{formatDate(userKey.verified_at)}</p>
                    </div>
                  )}

                  {!userKey.verified_at && (
                    <button
                      className="btn btn-primary"
                      onClick={handleVerifyKey}
                    >
                      Verify Key
                    </button>
                  )}
                </div>
              ) : (
                <div className="alert alert-info">
                  No encryption key found. Generate a new key below.
                </div>
              )}
            </div>
          </div>

          {/* Generate New Key Section */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Generate New Encryption Key</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Generate a new encryption key for securing your files and messages.
                This key will be used for client-side encryption.
              </p>

              <div className="mb-3">
                <button
                  className="btn btn-primary"
                  onClick={handleGenerateKey}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Key'}
                </button>
              </div>

              {newKey && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Your New Encryption Key</strong>
                    </label>
                    <div className="alert alert-warning">
                      <strong>Important:</strong> Save this key securely! You will need it to decrypt your files and messages.
                    </div>
                    <textarea
                      className="form-control font-monospace"
                      rows="3"
                      value={newKey}
                      readOnly
                    />
                  </div>

                  <button
                    className="btn btn-success"
                    onClick={handleUploadKey}
                  >
                    Upload Key
                  </button>
                </div>
              )}

              {/* Information Section */}
              <div className="mt-4">
                <h6>About Client-Side Encryption</h6>
                <p className="small text-muted">
                  <strong>Note:</strong> The current implementation uses placeholder encryption functions.
                  In a production environment, you should implement proper client-side encryption using:
                </p>
                <ul className="small text-muted">
                  <li>Web Crypto API for key generation and cryptographic operations</li>
                  <li>AES-GCM for symmetric encryption</li>
                  <li>RSA or ECDH for key exchange</li>
                  <li>Proper key derivation functions (PBKDF2, scrypt, or Argon2)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyManagement;
