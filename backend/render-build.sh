#!/bin/bash
set -e

echo "Installing FFmpeg..."
apt-get update
apt-get install -y ffmpeg

echo "Building backend..."
cd backend
npm install
npm run build

echo "Running migrations..."
npm run migrate

echo "Build completed successfully!"
