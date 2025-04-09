#!/bin/bash
set -e

echo "=== Starting build process ==="

# Ensure node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci
fi

echo "=== Building client ==="
# Build the client
npm run build

echo "=== Building server ==="
# Extract the server files
mkdir -p dist/server

# Create a simple ESM wrapper with path resolution
echo 'import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
global.__dirname = __dirname;
global.__filename = fileURLToPath(import.meta.url);

// Import the server code
import "./server.js";' > dist/server/index.js

# Use locally installed esbuild from node_modules to build the server with ESM format
./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/server/server.js

# Copy any other necessary server files
if [ -d "server/public" ]; then
  echo "Copying server/public to dist/server/public"
  mkdir -p dist/server/public
  cp -r server/public/* dist/server/public/
fi

# Create a .env file in the dist directory for deployment
if [ -f ".env" ]; then
  echo "Copying .env file to dist directory"
  cp .env dist/.env
fi

echo "=== Build completed successfully ==="
echo "To start the application, run: node dist/server/index.js"