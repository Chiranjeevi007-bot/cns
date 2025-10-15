import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import AuthService from './services/auth.service';

// Import components
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import MessageSend from './components/MessageSend';
import MessageList from './components/MessageList';
import UserProfile from './components/UserProfile';
import KeyManagement from './components/KeyManagement';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(AuthService.isAuthenticated());
    };
    
    checkAuth();
    
    // Check authentication status when local storage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
  };
  
  return (
    <Router>
      <div className="app">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">Secure Share</Link>
            
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                {isAuthenticated ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/files">Files</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/upload">Upload</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/messages">Messages</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/send">Send Message</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/keys">Key Management</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">Login</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register">Register</Link>
                    </li>
                  </>
                )}
              </ul>
              
              {isAuthenticated && (
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile">Profile</Link>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link btn btn-link" onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </nav>
        
        <div className="container mt-4">
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/files" element={
              <ProtectedRoute>
                <FileList />
              </ProtectedRoute>
            } />
            
            <Route path="/upload" element={
              <ProtectedRoute>
                <FileUpload />
              </ProtectedRoute>
            } />
            
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessageList />
              </ProtectedRoute>
            } />
            
            <Route path="/send" element={
              <ProtectedRoute>
                <MessageSend />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            <Route path="/keys" element={
              <ProtectedRoute>
                <KeyManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/files" /> : <Navigate to="/login" />
            } />
          </Routes>
        </div>
        
        <footer className="mt-5 py-3 bg-light text-center">
          <div className="container">
            <p className="mb-0">Secure Share &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;