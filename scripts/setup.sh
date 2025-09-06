#!/bin/bash

# Origen Setup Script
echo "🚀 Setting up Origen Receipt Management App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL first."
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build shared packages
echo "🔨 Building shared packages..."
yarn workspace @origen/models build
yarn workspace @origen/state build
yarn workspace @origen/utils build

# Copy environment files
echo "📋 Setting up environment files..."
if [ ! -f apps/server/.env ]; then
    cp apps/server/.env.example apps/server/.env
    echo "✅ Created apps/server/.env - please update with your database credentials"
else
    echo "ℹ️  apps/server/.env already exists"
fi

# Generate Prisma client
echo "🗄️  Setting up database..."
cd apps/server
yarn db:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update apps/server/.env with your database URL and JWT secret"
echo "2. Run database migrations: cd apps/server && yarn db:migrate"
echo "3. Start development servers: yarn dev"
echo ""
echo "🌐 Web app will be available at: http://localhost:3000"
echo "🔌 API server will be available at: http://localhost:3001"
