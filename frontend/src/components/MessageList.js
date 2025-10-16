import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MessageService from '../services/message.service';

const MessageList = () => {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all'); // all, inbox, sent
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await MessageService.getMessages();
      setMessages(data);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await MessageService.deleteMessage(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);
    } catch (err) {
      setError('Failed to delete message');
      console.error('Error deleting message:', err);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await MessageService.markAsRead(messageId);
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      await handleMarkAsRead(message.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'inbox') return msg.is_received;
    if (filter === 'sent') return msg.is_sent;
    return true;
  });

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
    <div className="message-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Messages</h2>
        <Link to="/send" className="btn btn-primary">
          Send Message
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-outline-primary ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${filter === 'inbox' ? 'active' : ''}`}
            onClick={() => setFilter('inbox')}
          >
            Inbox
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${filter === 'sent' ? 'active' : ''}`}
            onClick={() => setFilter('sent')}
          >
            Sent
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          {filteredMessages.length === 0 ? (
            <div className="alert alert-info">
              No messages found. <Link to="/send">Send a message</Link>
            </div>
          ) : (
            <div className="list-group">
              {filteredMessages.map(message => (
                <button
                  key={message.id}
                  className={`list-group-item list-group-item-action ${
                    selectedMessage?.id === message.id ? 'active' : ''
                  } ${!message.read && message.is_received ? 'fw-bold' : ''}`}
                  onClick={() => handleViewMessage(message)}
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">{message.subject}</h6>
                    {!message.read && message.is_received && (
                      <span className="badge bg-primary">New</span>
                    )}
                  </div>
                  <p className="mb-1 text-truncate">
                    {message.is_sent ? `To: ${message.recipient_username}` : `From: ${message.sender_username}`}
                  </p>
                  <small>{formatDate(message.created_at)}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-md-8">
          {selectedMessage ? (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{selectedMessage.subject}</h5>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(selectedMessage.id)}
                >
                  Delete
                </button>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>From:</strong> {selectedMessage.sender_username || selectedMessage.sender}
                </div>
                <div className="mb-3">
                  <strong>To:</strong> {selectedMessage.recipient_username || selectedMessage.recipient}
                </div>
                <div className="mb-3">
                  <strong>Date:</strong> {formatDate(selectedMessage.created_at)}
                </div>
                <hr />
                <div className="message-content">
                  {selectedMessage.content}
                </div>
                {selectedMessage.encryption_metadata && (
                  <div className="alert alert-info mt-3">
                    <small>
                      <strong>Encrypted:</strong> This message is encrypted using {selectedMessage.encryption_metadata.algorithm}
                    </small>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center text-muted">
                Select a message to view
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageList;
