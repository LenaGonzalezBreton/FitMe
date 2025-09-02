# Use a Node.js base image
FROM node:23-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies for development)
RUN npm install

# Copy entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose the port the app runs on
EXPOSE 3000

# Default entrypoint runs prisma generate, migrations, seed, then starts the app
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]