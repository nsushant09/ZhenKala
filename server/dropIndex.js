const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        const db = mongoose.connection.db;
        await db.collection('products').dropIndex('slug_1');
        console.log('✅ Index dropped successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

dropIndex();
