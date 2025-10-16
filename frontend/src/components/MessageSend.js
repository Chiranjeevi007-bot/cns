import React, { useState, useEffect } from 'react';
import MessageService from '../services/message.service';
import { generateEncryptionKey } from '../utils/encryption';

const MessageSend = () => {
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch users for recipient selection
    const fetchUsers = async () => {
      try {
        // This would be replaced with an actual API call to get users
        const users = [
          { id: '1', username: 'user1' },
          { id: '2', username: 'user2' },
          { id: '3', username: 'user3' }
        ];
        setRecipients(users);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  const handleSend = async () => {
    if (!selectedRecipient) {
      setError('Please select a recipient');
      return;
    }

    if (!subject) {
      setError('Please enter a subject');
      return;
    }

    if (!content) {
      setError('Please enter message content');
      return;
    }

    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      if (isEncrypted) {
        // Generate encryption key
        const encryptionKey = await generateEncryptionKey();
        
        // Get recipient's public key for secure key exchange (in a real app)
        // const publicKey = await UserService.getUserPublicKey(selectedRecipient);
        
        // Send encrypted message
        await MessageService.sendEncryptedMessage(
          selectedRecipient,
          subject,
          content,
          encryptionKey
        );
        
        setSuccess(`Message sent with encryption! Share this key with the recipient: ${encryptionKey}`);
      } else {
        // Send regular message
        await MessageService.sendMessage(selectedRecipient, subject, content);
        setSuccess('Message sent successfully!');
      }
      
      // Clear form
      setSubject('');
      setContent('');
    } catch (err) {
      setError(`Failed to send message: ${err.message}`);
      console.error('Send message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="message-send">
      <h2>Send Message</h2>
      
      <div className="form-group">
        <label>Recipient</label>
        <select 
          value={selectedRecipient}
          onChange={(e) => setSelectedRecipient(e.target.value)}
          disabled={isSending}
          className="form-control"
        >
          <option value="">Select recipient</option>
          {recipients.map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label>Subject</label>
        <input 
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isSending}
          className="form-control"
        />
      </div>
      
      <div className="form-group">
        <label>Message</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSending}
          className="form-control"
          rows="5"
        />
      </div>
      
      <div className="form-group">
        <label>
          <input 
            type="checkbox" 
            checked={isEncrypted} 
            onChange={() => setIsEncrypted(!isEncrypted)}
            disabled={isSending}
          />
          Encrypt message
        </label>
      </div>
      
      <button 
        onClick={handleSend} 
        disabled={isSending}
        className="btn btn-primary"
      >
        {isSending ? 'Sending...' : 'Send Message'}
      </button>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
    </div>
  );
};

export default MessageSend;