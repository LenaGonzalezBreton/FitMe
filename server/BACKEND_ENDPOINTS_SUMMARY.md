# 🚀 Backend Endpoints Summary - FitMe Application

This document provides a comprehensive overview of all the backend endpoints that have been implemented for the FitMe application.

## 📋 **Overview**

The backend has been completely restructured to include:
- **Exercise Management System** - CRUD operations for exercises
- **Workout Session System** - Session management and tracking
- **Streak Tracking System** - Workout streak calculations
- **Analytics Engine** - Data aggregation and insights
- **Notification System** - Push notifications and preferences
- **User Preferences** - Theme, language, and privacy settings

## 🏗️ **Architecture**

The backend follows Clean Architecture principles with Domain-Driven Design:
- **Domain Layer** - Business entities and rules
- **Application Layer** - Use cases and business logic
- **Infrastructure Layer** - Database and external service implementations
- **Presentation Layer** - Controllers and DTOs

## 🔐 **Authentication**

All endpoints (except public ones) require JWT authentication via the `Authorization: Bearer <token>` header.

---

## 💪 **Exercise Management System**

### **GET /exercises**
- **Description**: Get all exercises with optional filtering
- **Query Parameters**:
  - `category` - Filter by exercise category (e.g., MENSTRUAL_PHASE)
  - `intensity` - Filter by intensity level
  - `muscleGroup` - Filter by muscle group
  - `limit` - Number of results (default: 20)
  - `offset` - Pagination offset (default: 0)
- **Response**: List of exercises with metadata

### **GET /exercises/categories**
- **Description**: Get all available exercise categories
- **Response**: List of exercise categories and types

### **GET /exercises/{id}**
- **Description**: Get exercise details by ID
- **Response**: Complete exercise information

### **POST /exercises**
- **Description**: Create a custom exercise
- **Body**: Exercise data (title, description, intensity, etc.)
- **Response**: Created exercise

### **PUT /exercises/{id}**
- **Description**: Update an existing exercise
- **Body**: Updated exercise data
- **Response**: Updated exercise

### **DELETE /exercises/{id}**
- **Description**: Delete an exercise
- **Response**: Success confirmation

---

## 🏃‍♀️ **Workout Session System**

### **POST /workouts/sessions**
- **Description**: Start a new workout session
- **Body**: `{ programId?: string, title?: string }`
- **Response**: Created workout session

### **PUT /workouts/sessions/{id}/complete**
- **Description**: Complete a workout session
- **Body**: `{ notes?: string, rating?: number }`
- **Response**: Completed session details

### **GET /workouts/sessions/{id}**
- **Description**: Get workout session details
- **Response**: Complete session information with exercises

### **GET /workouts/sessions**
- **Description**: Get user's workout sessions
- **Query Parameters**:
  - `limit` - Number of results
  - `offset` - Pagination offset
  - `fromDate` - Filter from date
  - `toDate` - Filter to date
  - `status` - Filter by status
- **Response**: Paginated list of workout sessions

### **POST /workouts/sessions/{id}/exercises**
- **Description**: Log exercise completion within a session
- **Body**: Exercise completion data
- **Response**: Logged exercise details

### **PUT /workouts/sessions/{id}/pause**
- **Description**: Pause an active workout session
- **Response**: Paused session status

### **PUT /workouts/sessions/{id}/resume**
- **Description**: Resume a paused workout session
- **Response**: Resumed session status

### **GET /workouts/stats**
- **Description**: Get workout statistics
- **Query Parameters**:
  - `period` - Time period (week, month, year, all)
  - `fromDate` - Custom start date
  - `toDate` - Custom end date
- **Response**: Workout statistics and metrics

---

## 🔥 **Streak Tracking System**

### **GET /streaks**
- **Description**: Get user's streak data
- **Response**: Current streak, longest streak, workout counts

### **POST /streaks/log-workout**
- **Description**: Log a workout for streak tracking
- **Body**: `{ duration?: number, intensity?: string, notes?: string }`
- **Response**: Updated streak information

---

## 📊 **Analytics Engine**

### **GET /analytics/user**
- **Description**: Get user analytics overview
- **Response**: User performance metrics and insights

### **GET /analytics/workout**
- **Description**: Get workout-specific analytics
- **Response**: Workout performance data and trends

### **GET /analytics/cycle**
- **Description**: Get cycle-related analytics
- **Response**: Cycle performance and correlation data

---

## 🔔 **Notification System**

### **GET /notifications**
- **Description**: Get user notifications
- **Query Parameters**:
  - `limit` - Number of results
  - `offset` - Pagination offset
  - `read` - Filter by read status
- **Response**: List of notifications

### **PUT /notifications/{id}/read**
- **Description**: Mark notification as read
- **Response**: Updated notification

### **PUT /notifications/read-all**
- **Description**: Mark all notifications as read
- **Response**: Success confirmation

### **PUT /notifications/preferences**
- **Description**: Update notification preferences
- **Body**: Notification preference settings
- **Response**: Updated preferences

---

## ⚙️ **User Preferences**

### **GET /user-preferences**
- **Description**: Get user preferences
- **Response**: User settings and preferences

### **PUT /user-preferences**
- **Description**: Update user preferences
- **Body**: Preference updates
- **Response**: Updated preferences

### **GET /user-preferences/themes**
- **Description**: Get available themes
- **Response**: List of available themes

### **GET /user-preferences/languages**
- **Description**: Get available languages
- **Response**: List of available languages

---

## 🎯 **Program Management**

### **GET /programs**
- **Description**: Get user programs
- **Query Parameters**:
  - `isActive` - Filter by active status
  - `isTemplate` - Filter by template status
  - `limit` - Number of results
  - `offset` - Pagination offset
- **Response**: List of programs

### **GET /programs/{id}**
- **Description**: Get program details
- **Response**: Complete program information

### **POST /programs**
- **Description**: Create a new program
- **Body**: Program data
- **Response**: Created program

### **PUT /programs/{id}**
- **Description**: Update a program
- **Body**: Updated program data
- **Response**: Updated program

### **DELETE /programs/{id}**
- **Description**: Delete a program
- **Response**: Success confirmation

---

## 🌱 **Database Seeding**

The application includes comprehensive seeders for initial data:

### **Exercises Seeder**
- Creates exercises for each cycle phase
- Associates exercises with appropriate tags
- Provides phase-specific workout recommendations

### **Programs Seeder**
- Creates workout programs for each cycle phase
- Includes exercise sequences and timing
- Provides ready-to-use workout templates

### **Run Seeders**
```bash
npm run prisma:seed
```

---

## 🔧 **Technical Implementation**

### **Database Schema**
- **Prisma ORM** with PostgreSQL
- **Modular schema** organized by domain
- **Proper relationships** between entities
- **Indexing** for performance optimization

### **API Documentation**
- **OpenAPI/Swagger** integration
- **Comprehensive endpoint documentation**
- **Request/response examples**
- **Authentication requirements**

### **Error Handling**
- **Consistent error responses**
- **Proper HTTP status codes**
- **Detailed error messages**
- **Validation error handling**

### **Security**
- **JWT authentication**
- **Route guards**
- **Input validation**
- **SQL injection protection**

---

## 🚀 **Getting Started**

### **1. Build the Schema**
```bash
npm run prisma:build
```

### **2. Generate Prisma Client**
```bash
npm run prisma:generate
```

### **3. Push Schema to Database**
```bash
npm run prisma:push
```

### **4. Seed the Database**
```bash
npm run prisma:seed
```

### **5. Start the Application**
```bash
npm run start:dev
```

---

## 📱 **Frontend Integration**

All endpoints are designed to work seamlessly with the React Native frontend:
- **Consistent response format**
- **Proper error handling**
- **Real-time data updates**
- **Offline capability support**

---

## 🔮 **Future Enhancements**

### **Planned Features**
- **Real-time notifications** via WebSockets
- **Advanced analytics** with machine learning
- **Social features** for workout sharing
- **Integration** with fitness trackers
- **AI-powered** workout recommendations

### **Performance Optimizations**
- **Caching** for frequently accessed data
- **Database query optimization**
- **API response compression**
- **Background job processing**

---

## 📞 **Support**

For questions or issues with the backend implementation:
- Check the API documentation at `/api` endpoint
- Review the Prisma schema files
- Check the application logs
- Refer to the use case implementations

---

**🎉 The FitMe backend is now fully equipped with a comprehensive set of endpoints for exercise management, workout tracking, streak calculations, analytics, notifications, and user preferences!**

