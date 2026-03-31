#!/bin/bash
set -e

echo "Building GlobGlob..."

# Build frontend
echo "Building frontend..."
npm run build

# Build CDK (if needed)
if [ -d "infra" ]; then
  echo "Building CDK infrastructure..."
  cd infra
  npm install
  npm run build
  cd ..
fi

echo "Build complete!"
