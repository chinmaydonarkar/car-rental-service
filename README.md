# 🚗 CarRental Services - Complete Microservices Platform

A modern, production-ready car rental system built with **Node.js**, **TypeScript**, **MongoDB**, and **React**, featuring a beautiful frontend, robust backend microservices, and comprehensive booking management.

![CarRental Platform](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## 🎯 Features

### ✨ User Experience
- **Modern React Frontend** with glassmorphism design
- **Real-time car availability** with dynamic pricing
- **Seamless booking flow** with instant confirmation
- **User authentication** with JWT tokens
- **Responsive design** for all devices
- **Interactive booking management** with cancellation support

### 🔧 Backend Services
- **Microservices architecture** with API Gateway
- **Real-time car availability** calculation
- **Advanced booking validation** with conflict prevention
- **User management** with license validation
- **Comprehensive error handling** with user-friendly messages
- **Database optimization** with proper indexing

### 🛡️ Security & Validation
- **JWT-based authentication** with secure token management
- **License validity checks** through entire booking period
- **Duplicate booking prevention** with smart conflict detection
- **Input sanitization** and validation
- **Role-based access control**

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
│                    http://localhost:3000                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Login     │ │  Register   │ │   Browse    │ │ My Bookings │ │
│  │             │ │             │ │    Cars     │ │             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                               │
│                   http://localhost:3000                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Auth      │ │   Cars      │ │  Bookings   │ │   Users     │ │
│  │  Routes     │ │  Routes     │ │   Routes    │ │   Routes    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Car Service    │ │ Booking Service │ │  Auth Service   │
│  Port: 3001     │ │  Port: 3002     │ │  Port: 3002     │
│                 │ │                 │ │                 │
│ • Car Inventory │ │ • Bookings      │ │ • User Auth     │
│ • Availability  │ │ • Validation    │ │ • JWT Tokens    │
│ • Pricing       │ │ • Cancellation  │ │ • Registration  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                    ┌─────────────────┐
                    │   MongoDB       │
                    │   Atlas         │
                    │                 │
                    │ • Cars          │
                    │ • Users         │
                    │ • Bookings      │
                    └─────────────────┘
```

## 📁 Project Structure

```
Carental-Serivces/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Login.tsx        # User login
│   │   │   ├── Register.tsx     # User registration
│   │   │   ├── CustomerDashboard.tsx  # Main dashboard
│   │   │   ├── CarAvailability.tsx    # Car browsing
│   │   │   └── MyBookings.tsx   # Booking management
│   │   ├── services/            # API service layer
│   │   ├── types/               # TypeScript interfaces
│   │   └── assets/              # Static assets
│   ├── package.json
│   └── vite.config.ts
├── api-gateway/                 # API Gateway service
│   ├── src/
│   │   ├── routes/              # Route definitions
│   │   ├── services/            # Service clients
│   │   └── middleware/          # Gateway middleware
│   └── package.json
├── car-service/                 # Car management service
│   ├── src/
│   │   ├── domain/              # Domain models
│   │   ├── application/         # Business logic
│   │   ├── infrastructure/      # Data access
│   │   └── api/                 # API endpoints
│   ├── package.json
│   └── jest.config.js
├── booking-service/             # Booking management service
│   ├── src/
│   │   ├── domain/              # Domain models
│   │   ├── application/         # Business logic
│   │   ├── infrastructure/      # Data access
│   │   ├── api/                 # API endpoints
│   │   └── tests/               # Test suites
│   ├── package.json
│   └── jest.config.js
├── package.json                 # Root package.json
└── README.md
```

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account
- **Modern web browser**

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd Carental-Serivces

# Install all dependencies (root level)
npm install

# Install dependencies for each service
cd frontend && npm install
cd ../api-gateway && npm install
cd ../car-service && npm install
cd ../booking-service && npm install
cd ..
```

### 2. Environment Configuration

Create `.env` files in each service directory:

**frontend/.env:**
```env
VITE_API_BASE_URL=http://localhost:3000
```

**api-gateway/.env:**
```env
CAR_SERVICE_URL=http://localhost:3001
BOOKING_SERVICE_URL=http://localhost:3002
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**car-service/.env:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carental?retryWrites=true&w=majority
PORT=3001
BOOKING_SERVICE_URL=http://localhost:3002
```

**booking-service/.env:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carental?retryWrites=true&w=majority
PORT=3002
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Database Setup

```bash
# Seed the database with initial data
cd car-service && npm run seed
cd ../booking-service && npm run seed
cd ..
```

### 4. Start All Services

```bash
# Start all services concurrently (recommended)
npm run dev

# Or start individually:
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: API Gateway
cd api-gateway && npm run dev

# Terminal 3: Car Service
cd car-service && npm run dev

# Terminal 4: Booking Service
cd booking-service && npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:3000
- **Car Service:** http://localhost:3001
- **Booking Service:** http://localhost:3002

## 🎨 Frontend Features

### User Authentication
- **Secure login/registration** with form validation
- **JWT token management** with automatic refresh
- **Protected routes** with authentication guards
- **User profile management**

### Car Browsing Experience
- **Real-time availability** with date range selection
- **Dynamic pricing** based on seasonal rates
- **Visual car cards** with detailed information
- **Instant booking** with confirmation modals

### Booking Management
- **Active bookings** with status indicators
- **Cancellation support** with confirmation dialogs
- **Booking history** with detailed information
- **Conflict prevention** with smart validation

### Modern UI/UX
- **Glassmorphism design** with modern aesthetics
- **Responsive layout** for all screen sizes
- **Smooth animations** and transitions
- **Intuitive navigation** with clear feedback

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "licenseNumber": "DL123456789",
  "licenseValidUntil": "2025-12-31",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Car Service Endpoints

#### Get Car Availability
```http
GET /api/cars/availability?start=2024-07-15&end=2024-07-17
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "car123",
    "brand": "Toyota",
    "carModel": "Yaris",
    "available": 2,
    "totalStock": 3,
    "bookedCount": 1,
    "totalPrice": 295.29,
    "avgDayPrice": 98.43,
    "dayCounts": {
      "peak": 3,
      "mid": 0,
      "off": 0
    }
  }
]
```

### Booking Service Endpoints

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "carId": "car123",
  "startDate": "2024-07-15",
  "endDate": "2024-07-17",
  "licenseNumber": "DL123456789",
  "licenseValidUntil": "2025-12-31",
  "totalPrice": 295.29
}
```

#### Get User Bookings
```http
GET /api/bookings/my-bookings
Authorization: Bearer <token>
```

#### Cancel Booking
```http
PATCH /api/bookings/:bookingId/cancel
Authorization: Bearer <token>
```

## 🧪 Testing

### Run All Tests
```bash
# Run tests for all services
npm test

# Run tests individually
cd car-service && npm test
cd ../booking-service && npm test
```

### Test Coverage
- ✅ **Authentication** - Login, registration, token validation
- ✅ **Car Availability** - Real-time availability calculation
- ✅ **Booking Creation** - Validation, conflict prevention
- ✅ **Booking Management** - Cancellation, status updates
- ✅ **User Management** - Profile, license validation
- ✅ **Error Handling** - Proper HTTP status codes and messages

### Test Results
```
✓ Booking Service Tests: 6/6 passed
✓ Car Service Tests: All endpoints working
✓ Frontend Integration: Complete user flow tested
```

## 🚗 Car Inventory & Pricing

### Available Vehicles
| Brand     | Model    | Stock | Peak Season | Mid Season | Off Season |
|-----------|----------|-------|-------------|------------|------------|
| Toyota    | Yaris    | 3     | $98.43      | $76.89     | $53.65     |
| Seat      | Ibiza    | 5     | $85.12      | $65.73     | $46.85     |
| Nissan    | Qashqai  | 2     | $101.46     | $82.94     | $59.87     |
| Jaguar    | e-pace   | 1     | $120.54     | $91.35     | $70.27     |
| Mercedes  | Vito     | 2     | $109.16     | $89.64     | $64.97     |

### Seasonal Pricing Strategy
- **Peak Season** (Jun 1 - Sep 15): Highest rates for summer demand
- **Mid Season** (Sep 15 - Oct 31, Mar 1 - Jun 1): Moderate rates
- **Off Season** (Nov 1 - Mar 1): Lowest rates for winter months

## 🔒 Security Features

### Authentication & Authorization
- **JWT tokens** with secure expiration
- **Password hashing** with bcrypt
- **Token refresh** mechanism
- **Protected routes** with middleware

### Data Validation
- **License validity** checks through booking period
- **Date range validation** with business rules
- **Duplicate booking prevention** with smart conflict detection
- **Input sanitization** and type checking

### Error Handling
- **User-friendly error messages** with actionable guidance
- **Proper HTTP status codes** for different error types
- **Comprehensive logging** for debugging
- **Graceful degradation** for service failures

## 🏗️ Technical Architecture

### Backend Stack
- **Runtime:** Node.js 18+ with TypeScript
- **Framework:** Express.js with middleware support
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** JWT with bcrypt password hashing
- **Testing:** Jest with Supertest for API testing
- **Validation:** Custom domain validation with error handling

### Frontend Stack
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite for fast development
- **Styling:** CSS with glassmorphism design
- **State Management:** React hooks and context
- **HTTP Client:** Axios for API communication

### Design Patterns
- **Domain-Driven Design (DDD)** with clear boundaries
- **Hexagonal Architecture** for loose coupling
- **Repository Pattern** for data access
- **Service Layer Pattern** for business logic
- **Middleware Pattern** for cross-cutting concerns

## 🚀 Deployment

### Environment Variables
Set production environment variables:
```bash
# Production MongoDB
MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/carental

# Service URLs
CAR_SERVICE_URL=https://car-service.yourdomain.com
BOOKING_SERVICE_URL=https://booking-service.yourdomain.com

# Security
JWT_SECRET=your-production-jwt-secret-key

# Ports
PORT=3000
```


## 📈 Performance & Scalability

### Optimizations
- **Database indexing** for fast queries
- **Connection pooling** for MongoDB
- **Caching strategies** for car availability
- **Lazy loading** for frontend components
- **Code splitting** for better load times

### Monitoring
- **Health check endpoints** for all services
- **Performance metrics** collection
- **Error tracking** and alerting
- **Database query optimization**

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** the coding standards and patterns
4. **Add tests** for new functionality
5. **Commit** with meaningful messages
6. **Push** to your branch
7. **Create** a Pull Request

### Code Standards
- **TypeScript strict mode** enabled
- **ESLint** rules must pass
- **Prettier** formatting applied
- **Jest tests** must pass
- **Meaningful commit messages** required

### Testing Guidelines
- **Unit tests** for all business logic
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Test coverage** minimum 80%

## 📝 Changelog

### Version 2.0.0 (Current)
- ✨ **Complete React frontend** with modern UI
- 🔐 **JWT authentication** system
- 🚗 **Real-time car availability** calculation
- 🛡️ **Enhanced security** and validation
- 🧪 **Comprehensive test suite**

### Version 1.0.0
- 🏗️ **Microservices architecture**
- 📊 **Basic car availability** API
- 📅 **Booking management** system
- 🗄️ **MongoDB integration**

## 🆘 Support & Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :5173

# Kill processes if needed
kill -9 <PID>
```

#### MongoDB Connection Issues
```bash
# Check connection string format
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Verify network access
# Ensure IP is whitelisted in MongoDB Atlas
```

#### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run clean
```

### Getting Help
1. **Check the documentation** thoroughly
2. **Review existing issues** on GitHub
3. **Search for similar problems** in the codebase
4. **Create a detailed issue** with:
   - Error messages and stack traces
   - Steps to reproduce
   - Environment details
   - Expected vs actual behavior

---

**Built with ❤️ and ☕ by the chinmaydonarkar@gmail.com**

*Ready to revolutionize car rental experiences! 🚗✨* 