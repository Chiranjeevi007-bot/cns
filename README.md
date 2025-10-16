# Secure Share - Full-Stack Application

A secure file sharing and messaging application built with Django REST Framework backend and React frontend, featuring client-side encryption, file chunking, and comprehensive audit trails.

## Architecture Overview

### Backend (Django + PostgreSQL)

**Framework & Technologies:**
- Django 4.2.7
- Django REST Framework 3.14.0
- PostgreSQL Database
- JWT Authentication (djangorestframework-simplejwt)
- CORS Support (django-cors-headers)

**Apps Structure:**
- `users/` - User authentication and key management
- `files/` - File upload, chunking, and sharing
- `messages/` - Secure messaging system
- `api/` - Main API routing

### Frontend (React)

**Technologies:**
- React 18.2.0
- React Router 6.20.0 for navigation
- Axios for API communication
- CryptoJS for encryption utilities
- Formik & Yup for form validation

**Component Structure:**
- Authentication: Login, Register
- File Management: FileUpload, FileList
- Messaging: MessageSend, MessageList
- User: UserProfile, KeyManagement

## Core Features

### ✅ User Authentication

**Backend Endpoints:**
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - JWT-based login (returns access & refresh tokens)
- `POST /api/users/token/refresh/` - Refresh access token
- `GET/PUT /api/users/profile/` - View/update user profile

**Security:**
- JWT authentication with access and refresh tokens
- Custom user model with email as username
- Password validation with Django validators
- Protected routes requiring authentication

**Frontend Components:**
- `Login.js` - Login form with validation
- `Register.js` - Registration form with email validation
- `AuthService` - Handles token management
- Protected routes using React Router

### ✅ File Upload & Management

**Backend Endpoints:**
- `POST /api/files/upload/init/` - Initialize file upload
- `POST /api/files/upload/chunk/` - Upload file chunk
- `POST /api/files/upload/complete/` - Complete file upload
- `GET /api/files/` - List user's files
- `GET /api/files/<id>/` - Get file details
- `GET /api/files/<id>/download/` - Download file
- `POST /api/files/<id>/share/` - Share file with another user
- `DELETE /api/files/<id>/` - Delete file

**Features:**
- File chunking (1MB chunks by default)
- Chunk integrity verification with hashes
- Support for encrypted files
- File metadata storage (name, type, size, encryption status)
- File sharing with access control

**Frontend Components:**
- `FileUpload.js` - File upload with encryption option
- `FileList.js` - Display and manage uploaded files
- `FileService` - API integration for file operations

**File Chunking Implementation:**
- Files are split into chunks on the client side
- Each chunk is uploaded separately with a hash for integrity
- Upload progress tracking
- Chunks are reassembled on the server

### ✅ Messaging System

**Backend Endpoints:**
- `POST /api/messages/` - Send message
- `GET /api/messages/` - List all messages
- `GET /api/messages/<id>/` - Get message details
- `GET /api/messages/inbox/` - List received messages
- `GET /api/messages/sent/` - List sent messages
- `POST /api/messages/<id>/read/` - Mark message as read
- `DELETE /api/messages/<id>/` - Delete message

**Features:**
- Secure messaging between users
- Support for encrypted messages
- Message attachments (linked to files)
- Read/unread status tracking
- Inbox and sent message filtering

**Frontend Components:**
- `MessageSend.js` - Send message with encryption option
- `MessageList.js` - Display and manage messages
- `MessageService` - API integration for messaging

### ✅ Audit Trails

**Backend Implementation:**
- `FileAccessLog` model tracks all file operations:
  - upload_init, upload_complete, download, share, access_shared, delete
- `MessageAccessLog` model tracks all message operations:
  - send, read, delete
- Logs include:
  - User who performed the action
  - IP address
  - User agent
  - Timestamp

**Access:**
- Audit logs are automatically created for all operations
- Logs are stored in the database
- Can be queried for security analysis and compliance

### ✅ Encryption Key Management

**Backend Endpoints:**
- `GET /api/users/keys/` - Get user's encryption key
- `POST /api/users/keys/` - Upload encryption key
- `POST /api/users/keys/verify/` - Verify encryption key

**Frontend Component:**
- `KeyManagement.js` - Generate, upload, and verify encryption keys

**Features:**
- Client-side key generation
- Key fingerprint tracking
- Key verification status
- Secure key storage

## Placeholder Implementations

The following features have placeholder implementations with detailed comments on how to implement them properly:

### 🔄 Client-Side Encryption

**Location:** `frontend/src/utils/encryption.js`

**Placeholder Functions:**
- `encryptData()` - Currently returns mock encrypted data
- `decryptData()` - Currently returns mock decrypted data
- `hashData()` - Returns placeholder hash
- `generateEncryptionKey()` - Generates random key (basic implementation)

**Implementation Notes:**
Each function includes detailed TODO comments with:
- Steps required for proper implementation
- Example code using Web Crypto API
- Security best practices
- Recommended algorithms (AES-GCM for encryption, SHA-256 for hashing)

**Next Steps:**
1. Implement proper AES-GCM encryption using Web Crypto API
2. Add IV (Initialization Vector) generation and management
3. Implement proper key derivation from passwords (PBKDF2/Argon2)
4. Add RSA/ECDH for key exchange between users
5. Implement proper hash calculation for integrity verification

### 🔄 File Chunking Enhancements

**Location:** `frontend/src/services/file.service.js`

**Current Implementation:**
- Basic chunking working (splits files into 1MB chunks)
- Sequential upload of chunks
- Hash placeholder for integrity verification

**TODO Comments Include:**
- Progress callbacks for better UX
- Chunk retry logic for failed uploads
- Parallel chunk uploads with concurrency control
- Proper error handling and cleanup

## Installation & Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure PostgreSQL database
# Update settings.py with your database credentials

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will run on `http://localhost:3000` and proxy API requests to `http://localhost:8000`.

## Database Configuration

**PostgreSQL Settings (backend/secure_share/settings.py):**

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'secure_share'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}
```

**Important:** In production, use environment variables for database credentials. Never commit sensitive credentials to version control.

## API Documentation

### Authentication Flow

1. **Register:** POST `/api/users/register/`
   ```json
   {
     "username": "user@example.com",
     "email": "user@example.com",
     "password": "securepassword"
   }
   ```

2. **Login:** POST `/api/users/login/`
   ```json
   {
     "username": "user@example.com",
     "password": "securepassword"
   }
   ```
   Returns:
   ```json
   {
     "access": "jwt_access_token",
     "refresh": "jwt_refresh_token"
   }
   ```

3. **Use Token:** Include in request headers:
   ```
   Authorization: Bearer <access_token>
   ```

### File Upload Flow

1. **Initialize:** POST `/api/files/upload/init/`
2. **Upload Chunks:** POST `/api/files/upload/chunk/` (for each chunk)
3. **Complete:** POST `/api/files/upload/complete/`

### Message Flow

1. **Send Message:** POST `/api/messages/`
2. **List Messages:** GET `/api/messages/`
3. **Read Message:** GET `/api/messages/<id>/`
4. **Mark as Read:** POST `/api/messages/<id>/read/`

## Security Considerations

### Current Implementation

✅ **Implemented:**
- JWT-based authentication
- Protected API endpoints
- CORS configuration
- Password validation
- Audit trail logging
- File access control
- Message privacy (sender/recipient only)

⚠️ **Placeholder (Requires Implementation):**
- Client-side encryption (Web Crypto API)
- Proper key management and key exchange
- End-to-end encryption for messages
- Encrypted file storage

### Production Checklist

Before deploying to production:

1. **Security:**
   - [ ] Change SECRET_KEY in settings.py
   - [ ] Set DEBUG = False
   - [ ] Configure ALLOWED_HOSTS
   - [ ] Implement proper HTTPS
   - [ ] Implement rate limiting
   - [ ] Add CSRF protection for state-changing operations

2. **Encryption:**
   - [ ] Implement Web Crypto API for client-side encryption
   - [ ] Add proper key derivation functions
   - [ ] Implement secure key exchange
   - [ ] Add encryption for files at rest

3. **Infrastructure:**
   - [ ] Configure production database
   - [ ] Set up file storage (AWS S3, etc.)
   - [ ] Configure email for notifications
   - [ ] Set up logging and monitoring
   - [ ] Configure backup strategy

4. **Testing:**
   - [ ] Add unit tests for backend
   - [ ] Add integration tests for API
   - [ ] Add frontend component tests
   - [ ] Add end-to-end tests

## Project Status

### Fully Implemented ✅

- Django backend with PostgreSQL
- Django REST Framework API
- JWT authentication (login, register, token refresh)
- User model with encryption key support
- File upload with chunking
- File download and deletion
- File sharing between users
- Messaging system (send, receive, read, delete)
- Audit trails for files and messages
- React frontend with routing
- All required components (Login, Register, FileUpload, FileList, MessageSend, MessageList, UserProfile, KeyManagement)
- Protected routes
- API service layer

### Partially Implemented 🔄

- Client-side encryption (placeholders with detailed implementation notes)
- File chunk integrity verification (basic implementation, needs Web Crypto API)
- Key management (basic generation, needs proper cryptographic implementation)

### Architecture Verified ✅

- ✅ Full-stack application with Django backend and React frontend
- ✅ PostgreSQL database configuration
- ✅ Django REST Framework for API
- ✅ React with component structure and routing
- ✅ User authentication endpoints (register, login, token refresh)
- ✅ API secured with JWT authentication
- ✅ File uploading endpoints and components
- ✅ Messaging endpoints and components
- ✅ Placeholder functions for client-side encryption (with detailed comments)
- ✅ File chunking implementation
- ✅ Audit trail implementation

## Next Steps for Full Production Implementation

1. **Implement Web Crypto API encryption** in `frontend/src/utils/encryption.js`
2. **Add proper hash calculation** for file chunk integrity
3. **Implement key exchange** mechanism for secure communication
4. **Add comprehensive testing** (unit, integration, e2e)
5. **Implement rate limiting** to prevent abuse
6. **Add email notifications** for important events
7. **Set up continuous integration/deployment**
8. **Add monitoring and logging** infrastructure
9. **Implement data backup** and recovery procedures
10. **Security audit** and penetration testing

## Contributing

For development:
1. Follow existing code structure
2. Add tests for new features
3. Update documentation
4. Implement security best practices

## License

[Add your license here]

## Contact

[Add contact information]
