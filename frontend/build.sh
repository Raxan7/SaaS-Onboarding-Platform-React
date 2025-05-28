#!/bin/bash

# Build script for Render.com deployment
echo "Starting frontend build for Render.com..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Type check
echo "Running TypeScript type check..."
npx tsc -b

# Build the app
echo "Building the React app..."
npm run build

# Verify build output
echo "Verifying build output..."
if [ -d "dist" ]; then
    echo "✅ Build successful! Files in dist directory:"
    ls -la dist/
    
    # Make sure index.html exists
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html found in dist/"
    else
        echo "❌ index.html not found in dist/"
        exit 1
    fi
    
    # Make sure _redirects file is copied
    if [ -f "dist/_redirects" ]; then
        echo "✅ _redirects file found in dist/"
    else
        echo "⚠️  _redirects file not found, copying from public/"
        cp public/_redirects dist/_redirects
    fi
else
    echo "❌ Build failed! No dist directory found."
    exit 1
fi

echo "✅ Frontend build completed successfully!"