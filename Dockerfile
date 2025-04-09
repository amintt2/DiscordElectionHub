FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Copy .env.production to .env if it exists
RUN if [ -f .env.production ]; then cp .env.production .env; fi

# Make build.sh executable
RUN chmod +x ./build.sh

# Build the application using build.sh
RUN ./build.sh

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "dist/server/index.js"]
