const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Coupon = require('./models/Coupon');

dotenv.config();

const debugCoupons = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const coupons = await Coupon.find({});
        console.log('Total Coupons found:', coupons.length);
        
        const now = new Date();
        const midnight = new Date(now);
        midnight.setUTCHours(0, 0, 0, 0);
        
        console.log('--- CURRENTS ---');
        console.log('Now (UTC):', now.toISOString());
        console.log('Midnight (UTC):', midnight.toISOString());
        
        coupons.forEach(c => {
            console.log(`\nCode: ${c.code}`);
            console.log(`isActive: ${c.isActive} (${typeof c.isActive})`);
            console.log(`startDate: ${c.startDate.toISOString()}`);
            console.log(`endDate: ${c.endDate.toISOString()}`);
            
            const startOk = c.startDate <= now;
            const endOk = c.endDate >= midnight;
            
            console.log(`Criteria Check:`);
            console.log(`- startDate <= now: ${startOk}`);
            console.log(`- endDate >= midnight: ${endOk}`);
            console.log(`- Result: ${c.isActive && startOk && endOk ? 'VALID' : 'INVALID'}`);
        });
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Debug Error:', err);
    }
};

debugCoupons();
