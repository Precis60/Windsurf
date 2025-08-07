#!/bin/bash

# Development startup script for Precision Cabling & Automation

echo "🚀 Starting Precision Cabling & Automation Development Environment"
echo "=================================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   macOS: brew install node"
    echo "   Other: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if environment files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Copying from example..."
    cp backend/.env.example backend/.env
    echo "🔧 Please edit backend/.env with your AWS RDS credentials"
fi

if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env file not found. Copying from example..."
    cp .env.example .env
fi

echo ""
echo "🎯 Next steps:"
echo "1. Setup AWS RDS database (see backend/AWS_RDS_SETUP.md)"
echo "2. Update backend/.env with your database credentials"
echo "3. Run database setup: cd backend && npm run setup-db"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: npm run dev"
echo ""
echo "📚 Demo accounts will be created automatically:"
echo "   Admin: admin@precisioncabling.com / Admin123!"
echo "   Customer: customer@example.com / Customer123!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "📖 For detailed setup instructions, see README.md"
