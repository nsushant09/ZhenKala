# Thangka E-commerce Website - MERN Stack

A full-featured e-commerce website for Thangka art and Himalayan handicrafts built with MongoDB, Express.js, React.js, and Node.js.

## 🎨 Features

### Customer Features
- Browse products with advanced filtering (category, price, rating)
- Product search functionality
- Shopping cart (works for both guest and logged-in users)
- User authentication (Register/Login)
- User profile management
- Order history and tracking
- Product reviews and ratings
- Responsive design based on Figma mockups

### Admin Features
- Admin dashboard
- Product management (Create, Read, Update, Delete)
- Order management and status updates
- User management
- Inventory tracking

## 🛠️ Tech Stack

**Frontend:**
- React.js 18
- React Router DOM for navigation
- Context API for state management
- Axios for API calls
- React Icons

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- MongoDB - Either:
  - Local installation - [Download here](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (cloud) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- Git (optional) - [Download here](https://git-scm.com/)
- Code editor (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🚀 Installation & Setup

### Step 1: Extract the Project
Extract the downloaded `thangka-ecommerce` folder to your desired location.

### Step 2: Backend Setup

1. Open terminal/command prompt and navigate to the server folder:
```bash
cd thangka-ecommerce/server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# Copy the example env file
cp .env.example .env

# Or on Windows:
copy .env.example .env
```

4. Edit the `.env` file with your settings:
```env
PORT=5000
NODE_ENV=development

# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/thangka-ecommerce

# OR for MongoDB Atlas (recommended):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/thangka-ecommerce

# Generate a random secret for JWT (you can use any random string):
JWT_SECRET=your_super_secret_jwt_key_change_this

JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

5. Seed the database with sample data:
```bash
node seeder.js
```

This will create:
- An admin account (email: admin@zhenkala.com, password: admin123)
- A test user account (email: john@example.com, password: password123)
- Sample products

6. Start the backend server:
```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected Successfully
```

### Step 3: Frontend Setup

1. Open a NEW terminal window and navigate to the client folder:
```bash
cd thangka-ecommerce/client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
# Create .env file in client folder
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

4. Start the React development server:
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

## 👤 Default Login Credentials

**Admin Account:**
- Email: admin@zhenkala.com
- Password: admin123

**Test User Account:**
- Email: john@example.com
- Password: password123

## 📁 Project Structure

```
thangka-ecommerce/
├── server/                 # Backend Node.js/Express
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── .env.example       # Environment variables template
│   ├── server.js          # Entry point
│   ├── seeder.js          # Database seeder
│   └── package.json       # Dependencies
│
└── client/                # Frontend React
    ├── public/            # Static files
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── context/       # React Context (state management)
    │   ├── pages/         # Page components
    │   ├── services/      # API service
    │   ├── utils/         # Utility functions & theme
    │   ├── App.js         # Main App component
    │   ├── index.js       # Entry point
    │   └── index.css      # Global styles
    └── package.json       # Dependencies
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `POST /api/products/:id/reviews` - Create review (Protected)

### Cart
- `GET /api/cart` - Get user cart (Protected)
- `POST /api/cart` - Add item to cart (Protected)
- `PUT /api/cart/:productId` - Update cart item (Protected)
- `DELETE /api/cart/:productId` - Remove from cart (Protected)
- `DELETE /api/cart` - Clear cart (Protected)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders/myorders` - Get user orders (Protected)
- `GET /api/orders/:id` - Get order by ID (Protected)
- `PUT /api/orders/:id/pay` - Update order to paid (Protected)
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## 🎨 Design System

The application follows the Thangka Figma design with:
- **Primary Color:** `#2C1810` (Dark Brown)
- **Secondary Color:** `#8B4513` (Saddle Brown)
- **Accent Color:** `#D4AF37` (Gold)
- **Fonts:** Outfit (primary), Kalam (secondary)
- **Spacing:** Consistent spacing system
- **Components:** Reusable, themeable components

## 🔧 Common Issues & Solutions

### MongoDB Connection Error
- Make sure MongoDB is running (if using local)
- Check your MONGO_URI in .env file
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use
```bash
# Kill the process using the port
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:5000 | xargs kill
```

### Cannot find module errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📦 Deployment

### Backend (Node.js/Express)
Recommended platforms:
- Heroku
- AWS EC2
- DigitalOcean
- Railway

### Frontend (React)
Recommended platforms:
- Vercel
- Netlify
- AWS S3 + CloudFront

### Database (MongoDB)
Recommended:
- MongoDB Atlas (already configured for cloud)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For support, email support@zhenkala.com or create an issue in the repository.

## 🙏 Acknowledgments

- Design based on traditional Thangka art and Himalayan culture
- Built with modern web technologies
- Inspired by artisan communities in Nepal

---

**Happy Coding! 🎨**
