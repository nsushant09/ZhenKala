# 🚀 Quick Start Guide - Thangka E-commerce

## ⚡ Super Fast Setup (5 Minutes)

### Prerequisites Check
✅ Node.js installed? Run: `node --version`
✅ If not installed: Download from https://nodejs.org/

### Step 1: Extract & Navigate
Extract the `thangka-ecommerce` folder and open terminal/command prompt in that folder.

### Step 2: Backend Setup (2 minutes)
```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` file - just change this line:
```
MONGO_URI=mongodb://localhost:27017/thangka-ecommerce
```
**OR use MongoDB Atlas (free cloud database - recommended):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Paste it in MONGO_URI

### Step 3: Add Sample Data
```bash
node seeder.js
```

### Step 4: Start Backend
```bash
npm run dev
```
✅ Should see: "Server running on port 5000"
✅ Keep this terminal open!

### Step 5: Frontend Setup (Open NEW Terminal)
```bash
cd client
npm install
npm start
```
✅ Browser will open automatically at http://localhost:3000

## 🎉 You're Done!

### Login Credentials:
**Admin:**
- Email: admin@zhenkala.com
- Password: admin123

**Test User:**
- Email: john@example.com  
- Password: password123

## 📋 What's Working:

✅ Backend API (all endpoints)
✅ Database models & relationships
✅ Authentication & authorization
✅ JWT token system
✅ Cart functionality
✅ Order management
✅ User management
✅ Admin features
✅ React app structure
✅ Routing
✅ Context API state management
✅ Theme system (based on Figma)
✅ Navbar & Footer

## 🚧 What Needs Implementation:

The following pages need UI implementation (placeholder files are ready):
- HomePage (hero section, featured products, testimonials)
- ProductsPage (product grid with filters)
- ProductDetailPage (product info, images, reviews)
- CartPage (cart items, checkout button)
- CheckoutPage (shipping, payment)
- LoginPage & RegisterPage (forms)
- ProfilePage (user info, edit)
- OrdersPage & OrderDetailPage (order history)
- AboutPage & ContactPage (content)
- Admin pages (dashboards, management)

All the backend API is ready and working! You just need to build the UI components and connect them to the API.

## 📝 Next Steps:

1. ✅ Test the backend API using Postman or browser
2. ✅ Create one page at a time (start with Login/Register)
3. ✅ Use the theme variables in `/client/src/utils/theme.js`
4. ✅ Reference the Figma design for styling
5. ✅ All API calls go through `/client/src/services/api.js`

## 🆘 Common Issues:

**Port 5000 already in use:**
- Kill the process or change PORT in .env

**MongoDB connection error:**
- Check MongoDB is running (if local)
- Or use MongoDB Atlas (easier!)

**npm install errors:**
- Delete node_modules folder
- Run `npm install` again

## 💡 Pro Tips:

- Backend runs on port 5000
- Frontend runs on port 3000
- Keep both terminals open while developing
- Changes to React files = automatic refresh
- Changes to server files = automatic restart (nodemon)

---

**Need Help?** Check the main README.md for detailed documentation!
