# Civix - Digital Civic Platform

**Team 02 - February 2026**

A digital civic platform built with Node.js, Express, and MongoDB for community engagement and civic services.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Scripts](#scripts)

---

## ✨ Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Role-Based Access Control**: Different permission levels for users
- **Dashboard**: Protected user dashboard
- **Location Validation**: Built-in location validation utilities
- **Rate Limiting**: API protection against abuse
- **Security Hardening**: Helmet.js security headers
- **Error Handling**: Centralized error handling middleware
- **Cookie-based Sessions**: Secure cookie management

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5.2.1)
- **Database**: MongoDB with Mongoose (v9.2.0)
- **Authentication**: JWT (jsonwebtoken v9.0.3)
- **Password Hashing**: bcryptjs (v3.0.3)
- **Security**: Helmet.js (v8.1.0)
- **Rate Limiting**: express-rate-limit (v8.2.1)
- **CORS**: cors (v2.8.6)
- **Logging**: Morgan (v1.10.1)
- **Dev Tools**: Nodemon (v3.1.11)

### Frontend
- **Framework**: React (planned)

---

## 📁 Project Structure

```
Digital-civic-feb-team02/
├── Backend/
│   ├── src/
│   │   ├── app.js                 # Express app configuration
│   │   ├── server.js              # Server entry point
│   │   ├── config/
│   │   │   └── db.js              # MongoDB configuration
│   │   ├── controllers/
│   │   │   └── authController.js  # Authentication logic
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT verification
│   │   │   ├── errorMiddleware.js # Error handling
│   │   │   └── roleMiddleware.js  # Role-based access
│   │   ├── models/
│   │   │   └── User.js            # User schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # Auth endpoints
│   │   │   └── dashboardRoutes.js # Dashboard endpoints
│   │   └── utils/
│   │       ├── jwt.js             # JWT utilities
│   │       └── locationValidator.js # Location validation
│   ├── .env                       # Environment variables
│   └── package.json               # Dependencies
├── Frontend/
│   └── gitkeep
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Digital-civic-feb-team02
   ```

2. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the `Backend` directory (see [Environment Variables](#environment-variables))

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

---

## 🔐 Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Important**: Never commit the `.env` file to version control!

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login user and get token |
| GET | `/api/auth/me` | Private | Get current user profile |
| POST | `/api/auth/logout` | Private | Logout user |

### Dashboard Routes (`/api/dashboard`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard` | Private | Get user dashboard data |

### Request Examples

**Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "citizen"
}
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Current User** (requires JWT token)
```bash
GET /api/auth/me
Authorization: Bearer <your_jwt_token>
```

---

## 🔒 Security Features

- **Helmet.js**: Sets security-related HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for passwords
- **Request Size Limiting**: JSON payload limited to 10kb
- **Cookie Security**: HTTP-only cookies with secure flags
- **Error Handling**: No sensitive information leaked in errors

---

## 📜 Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Run tests (not implemented yet)
npm test
```

---

## 👥 Team

**Team 02 - February 2026**

---

## 📝 License

ISC

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For support, email your team lead or create an issue in the repository.

---

**Built with ❤️ by Team 02**
