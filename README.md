# FitMe - Full-Stack Mobile Application

A monorepo for a full-stack fitness application. This project is set up with a React Native (Expo) client and a NestJS backend, containerized with Docker.

## 📦 Tech Stack

- **Monorepo Management**: npm Workspaces
- **Frontend (Mobile)**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: NestJS
- **Real-time Communication**: Socket.IO
- **Database**: PostgreSQL
- **Caching**: Redis
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
/
├── client/        # React Native app (Expo + NativeWind)
├── server/        # NestJS backend
├── docker-compose.yml
├── .env.example   # Example environment variables
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (23 or later)
- Docker & Docker Compose
- An `.env` file (see configuration section)
- The [Expo Go](https://expo.dev/go) app on your mobile device.

### 1. Environment Configuration

This project uses a `.env` file for managing environment variables. To get started, copy the example file:

```bash
cp .env.example .env
```

Then, fill in the required values in the newly created `.env` file. It will be ignored by Git.

**Example `.env` content:**
```
# Prisma 
DATABASE_URL="postgresql://admin:password@postgres:5432/fitme?schema=public"

# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=fitme

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Server
PORT=3000

# Firebase - Add your service account credentials here
# You can get this from your Firebase project settings
# It's recommended to use secrets management for production
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
# FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@...iam.gserviceaccount.com"
# FIREBASE_PROJECT_ID="your-project-id"
```

### 2. Docker-Based Setup (Recommended)

The entire stack can be run using Docker Compose, with hot-reloading enabled for both the client and server.

**First-Time Setup or After Dependency Changes:**

If you are running this for the first time, or if you have changed `package.json` files or a `Dockerfile`, you must build the images:
```bash
docker-compose up --build
```

**Day-to-Day Development:**

For your daily work, you do **not** need to use the `--build` flag. You can start the development servers with:
```bash
docker-compose up
```

**Connecting Expo Go:**

The `client` service will output a tunnel URL and a corresponding QR code in the Docker logs. Use the Expo Go app on your phone to scan this QR code to open the project.

- **API Server**: `http://localhost:3000`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **Expo Metro Bundler**: `localhost:8081`

To stop all running containers, press `Ctrl+C` in the terminal where compose is running, and then run:
```bash
docker-compose down
```

### 3. Local Development (Without Docker)

If you prefer to run services locally without Docker:

**Setup the Server:**
```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Run the development server
npm run start:dev
```

**Setup the Client:**
```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the Expo development server
npm start
```
This will start the Metro bundler and provide a QR code to scan with the Expo Go app.

### 🔥 Firebase Setup Instructions

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Generate a Service Account Key (for the Server)**:
    - In your Firebase project, go to `Project settings` > `Service accounts`.
    - Click `Generate new private key`. A JSON file will be downloaded.
    - Use the contents of this file to populate the `FIREBASE_*` variables in your `.env` file. The `privateKey` needs to be correctly formatted (often requires replacing `\n` characters).
3.  **Register your App (for the Client)**:
    - In the Firebase project settings, add a new Android and/or iOS app.
    - Follow the setup instructions to get your client-side Firebase configuration.
    - You will need to create a `firebase-config.ts` in the client's `src/config` directory to house these credentials.
