# Base image
FROM node:20

# Install compilers/interpreters
RUN apt-get update && apt-get install -y \
    g++ \
    python3 \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create required folders
RUN mkdir -p codes inputs

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "index.js"]