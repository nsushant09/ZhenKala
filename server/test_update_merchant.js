const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MerchantDetails = require('./models/MerchantDetails');

dotenv.config();

const testUpdate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        let details = await MerchantDetails.getSingleton();
        console.log('Before Update:', details.deliveryCharges);
        
        const updateData = {
            deliveryCharges: {
                nepal: Math.floor(Math.random() * 1000),
                international: Math.floor(Math.random() * 5000)
            },
            freeShippingThreshold: 15000
        };
        
        Object.assign(details, updateData);
        await details.save();
        
        let updatedDetails = await MerchantDetails.getSingleton();
        console.log('After Update:', updatedDetails.deliveryCharges);
        console.log('Threshold:', updatedDetails.freeShippingThreshold);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Update Test Error:', err);
    }
};

testUpdate();
