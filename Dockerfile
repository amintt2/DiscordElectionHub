FROM node:18-slim

# Install necessary tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Copy .env.production to .env if it exists
RUN if [ -f .env.production ]; then cp .env.production .env; fi

# Build the client
RUN npm run build

# Build the server
RUN mkdir -p dist/server
# Create a simple ESM wrapper for the server
RUN echo 'import { fileURLToPath } from "url";\
global.__dirname = fileURLToPath(new URL(".", import.meta.url));\
import "./server.js";' > dist/server/index.js
# Build the server with CommonJS format
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outdir=dist/server --outfile=dist/server/server.js

# Copy any other necessary server files
RUN if [ -d "server/public" ]; then mkdir -p dist/server/public && cp -r server/public/* dist/server/public/; fi

# Copy .env to dist directory if it exists
RUN if [ -f ".env" ]; then cp .env dist/.env; fi

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "dist/server/index.js"]
