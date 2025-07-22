# Use a Node.js base image
FROM node:23-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies for development)
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Start the app in development mode with Nest watch for auto-restart
CMD ["sh", "-c", "npm run prisma:push && npm run start:dev"]