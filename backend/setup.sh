#!/bin/bash

# RoadmapX Backend Setup Script

echo "🚀 Setting up RoadmapX Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your AWS credentials and database URL"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your AWS credentials and database URL"
echo "2. Set up your PostgreSQL database (AWS RDS or local)"
echo "3. Run 'npm run db:push' to create database tables"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "For more information, see the README.md file."
