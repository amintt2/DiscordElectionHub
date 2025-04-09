#!/bin/bash

# Build the client
npm run build

# Extract the server files
mkdir -p dist/server
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server

echo "Build completed successfully. Use 'node dist/server/index.js' to start the application."