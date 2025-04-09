#!/bin/bash
set -e

# Log startup information
echo "=== Starting Discord Election Hub ==="
echo "Environment: $NODE_ENV"
echo "Host: $HOST"
echo "Port: $PORT"

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Check if server build exists
if [ ! -f "dist/server/index.js" ]; then
  echo "Error: Server build not found. Run build.sh first."
  exit 1
fi

# Start the application
echo "Starting server..."
node dist/server/index.js