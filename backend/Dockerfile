FROM node:20-slim

# Install FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy source code
COPY backend/dist ./dist
COPY backend/src/db/migrations ./src/db/migrations

# Create directories
RUN mkdir -p data videos

EXPOSE 10000

CMD ["node", "dist/server.js"]
