#!/bin/bash

echo "🚀 Thangka E-commerce Setup Script"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd server
npm install
echo "✅ Backend dependencies installed"
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file - Please update with your MongoDB URI"
else
    echo "ℹ️  .env file already exists"
fi
echo ""

# Frontend Setup
echo "📦 Setting up Frontend..."
cd ../client
npm install
echo "✅ Frontend dependencies installed"
echo ""

echo "===================================="
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update server/.env with your MongoDB connection string"
echo "2. Run 'node server/seeder.js' to populate sample data"
echo "3. Start backend: cd server && npm run dev"
echo "4. Start frontend (in new terminal): cd client && npm start"
echo ""
echo "📧 Default Admin Login:"
echo "   Email: admin@zhenkala.com"
echo "   Password: admin123"
echo ""
echo "Happy coding! 🎨"
