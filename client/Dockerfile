# Use a Node.js base image
FROM node:23-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -g expo-cli && npm install

# Copy the rest of the application code
COPY . .

# Expose the port for the Expo Metro Bundler
EXPOSE 8081

# Start the Expo development server
CMD ["npm", "start"] 