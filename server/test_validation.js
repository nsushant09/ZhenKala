const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('./models/Coupon');

dotenv.config();

const testValidation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const code = 'TESTPROMO';
        
        // Remove existing if any
        await Coupon.deleteOne({ code });
        
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - 1); // Started yesterday
        const end = new Date(now);
        end.setDate(now.getDate() + 7); // Expires in 7 days
        
        const coupon = await Coupon.create({
            code,
            discountPercent: 10,
            startDate: start,
            endDate: end,
            isActive: true
        });
        
        console.log('Created Test Coupon:', coupon.code);
        
        // Emulate validate logic
        const midnight = new Date(now);
        midnight.setUTCHours(0, 0, 0, 0);
        
        const found = await Coupon.findOne({
            code: code.trim().toUpperCase(),
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: midnight },
        });
        
        if (found) {
            console.log('✅ Validation SUCCESS in Node environment');
        } else {
            console.log('❌ Validation FAILED in Node environment');
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Test Error:', err);
    }
};

testValidation();
