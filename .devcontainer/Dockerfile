FROM mcr.microsoft.com/devcontainers/python:3.11

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Set environment variables
ENV PYTHONPATH=/workspace/backend
ENV NODE_ENV=development
