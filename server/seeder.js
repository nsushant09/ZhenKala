const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@zhenkala.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
  },
];

const products = [
  {
    name: 'Reduk Wheel of Life',
    description: 'A magnificent hand-painted Thangka depicting the Wheel of Life (Bhavachakra), representing the cycle of existence in Buddhist cosmology. This piece features intricate details and vibrant colors, painted by master artisans using traditional mineral pigments and 24K gold.',
    price: 250,
    originalPrice: 500,
    discount: 50,
    category: 'Thangka Art',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
        alt: 'Reduk Wheel of Life Thangka',
      },
    ],
    stock: 5,
    rating: 4.8,
    numReviews: 12,
    specifications: {
      size: '24" x 36"',
      material: 'Cotton canvas, mineral pigments, 24K gold',
      weight: '0.5 kg',
      color: 'Multi-color',
      origin: 'Kathmandu, Nepal',
      customization: true,
    },
    tags: ['thangka', 'buddhist art', 'wheel of life', 'traditional'],
    isFeatured: true,
  },
  {
    name: 'Medicine Buddha Thangka',
    description: 'Exquisite Medicine Buddha Thangka painted with traditional techniques. The Medicine Buddha is known for healing physical and mental ailments. This piece showcases the deep blue Buddha in meditation pose, holding a myrobalan plant.',
    price: 450,
    originalPrice: 450,
    discount: 0,
    category: 'Thangka Art',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1604076947420-d3c5c9e77dd3?w=800',
        alt: 'Medicine Buddha Thangka',
      },
    ],
    stock: 0,
    rating: 5.0,
    numReviews: 8,
    specifications: {
      size: '30" x 42"',
      material: 'Cotton canvas, mineral pigments, 24K gold',
      weight: '0.7 kg',
      color: 'Blue, Gold',
      origin: 'Patan, Nepal',
      customization: false,
    },
    tags: ['thangka', 'medicine buddha', 'healing', 'buddhist art'],
    isFeatured: true,
  },
  {
    name: 'Green Tara Thangka',
    description: 'Beautiful Green Tara Thangka, the goddess of compassion and action. Hand-painted with meticulous attention to detail, featuring the goddess in her characteristic pose on a lotus throne.',
    price: 380,
    originalPrice: 380,
    discount: 0,
    category: 'Thangka Art',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=800',
        alt: 'Green Tara Thangka',
      },
    ],
    stock: 3,
    rating: 4.9,
    numReviews: 15,
    specifications: {
      size: '28" x 40"',
      material: 'Cotton canvas, mineral pigments, gold leaf',
      weight: '0.6 kg',
      color: 'Green, Gold',
      origin: 'Bhaktapur, Nepal',
      customization: true,
    },
    tags: ['thangka', 'green tara', 'compassion', 'deity'],
    isFeatured: false,
  },
  {
    name: 'Tibetan Singing Bowl Set',
    description: 'Handcrafted Tibetan singing bowl made from seven sacred metals. Produces deep, resonant tones perfect for meditation, healing, and chakra balancing. Includes wooden striker and cushion.',
    price: 120,
    originalPrice: 120,
    discount: 0,
    category: 'Singing Bowl',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1545958119-ca1279e73c8a?w=800',
        alt: 'Tibetan Singing Bowl',
      },
    ],
    stock: 15,
    rating: 4.7,
    numReviews: 24,
    specifications: {
      size: '6 inches diameter',
      material: 'Seven sacred metals (Gold, Silver, Mercury, Copper, Iron, Tin, Lead)',
      weight: '0.8 kg',
      color: 'Bronze',
      origin: 'Kathmandu, Nepal',
      customization: false,
    },
    tags: ['singing bowl', 'meditation', 'healing', 'sound therapy'],
    isFeatured: true,
  },
  {
    name: 'Buddha Statue - Shakyamuni',
    description: 'Handcrafted bronze statue of Shakyamuni Buddha in meditation pose. Features intricate detailing and traditional craftsmanship. Perfect for home altars or meditation spaces.',
    price: 350,
    originalPrice: 350,
    discount: 0,
    category: 'Statues',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1615680022647-99c397cbcbdd?w=800',
        alt: 'Shakyamuni Buddha Statue',
      },
    ],
    stock: 8,
    rating: 4.9,
    numReviews: 10,
    specifications: {
      size: '12 inches height',
      material: 'Bronze with gold gilding',
      weight: '2.5 kg',
      color: 'Bronze, Gold',
      origin: 'Patan, Nepal',
      customization: false,
    },
    tags: ['statue', 'buddha', 'bronze', 'shakyamuni'],
    isFeatured: false,
  },
  {
    name: 'Tibetan Prayer Flags',
    description: 'Traditional Tibetan prayer flags featuring sacred mantras and symbols. Made from cotton cloth and printed with traditional woodblocks. Set includes 25 flags on a 20-foot string.',
    price: 35,
    originalPrice: 35,
    discount: 0,
    category: 'Prayer Flags',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?w=800',
        alt: 'Tibetan Prayer Flags',
      },
    ],
    stock: 50,
    rating: 4.6,
    numReviews: 32,
    specifications: {
      size: '25 flags, each 8" x 10"',
      material: 'Cotton cloth',
      weight: '0.2 kg',
      color: 'Multi-color (Blue, White, Red, Green, Yellow)',
      origin: 'Kathmandu, Nepal',
      customization: false,
    },
    tags: ['prayer flags', 'tibetan', 'mantras', 'blessings'],
    isFeatured: false,
  },
  {
    name: 'Silk Brocade Frame',
    description: 'Premium silk brocade frame for Thangka paintings. Features traditional Himalayan patterns and high-quality silk. Available in multiple colors and sizes to complement your sacred art.',
    price: 180,
    originalPrice: 180,
    discount: 0,
    category: 'Silk Brocade',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800',
        alt: 'Silk Brocade Frame',
      },
    ],
    stock: 20,
    rating: 4.8,
    numReviews: 18,
    specifications: {
      size: 'Custom sizing available',
      material: 'High-quality silk with traditional patterns',
      weight: '0.3 kg',
      color: 'Multiple colors available',
      origin: 'Kathmandu, Nepal',
      customization: true,
    },
    tags: ['silk brocade', 'frame', 'thangka accessories'],
    isFeatured: false,
  },
  {
    name: 'Mandala Oil Painting',
    description: 'Stunning mandala oil painting on canvas. Features intricate geometric patterns and vibrant colors representing the universe in Buddhist and Hindu symbolism.',
    price: 420,
    originalPrice: 420,
    discount: 0,
    category: 'Oil Painting',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
        alt: 'Mandala Oil Painting',
      },
    ],
    stock: 6,
    rating: 4.9,
    numReviews: 9,
    specifications: {
      size: '36" x 36"',
      material: 'Canvas, oil paints',
      weight: '1.2 kg',
      color: 'Multi-color',
      origin: 'Kathmandu, Nepal',
      customization: true,
    },
    tags: ['oil painting', 'mandala', 'sacred geometry', 'art'],
    isFeatured: true,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    console.log('🗑️  Data cleared');

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log('👤 Users seeded');

    // Insert products
    await Product.insertMany(products);
    console.log('📦 Products seeded');

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Admin Login:');
    console.log('   Email: admin@zhenkala.com');
    console.log('   Password: admin123');
    console.log('\n📧 Test User Login:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
