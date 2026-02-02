const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

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

const categoryHierarchy = [
  {
    name: 'Thangka Art',
    children: [
      {
        name: 'Deities',
        children: [
          {
            name: 'Peaceful Deities',
            children: [
              { name: 'White Tara' },
              { name: 'Green Tara' },
              { name: 'Chenrezig' },
              { name: 'Medicine Buddha' },
              { name: 'Amitabha Buddha' },
              { name: 'Avalokiteshvara' },
              { name: 'Saraswati' }
            ]
          },
          {
            name: 'Wrathful Protectors',
            children: [
              { name: 'Mahakala' },
              { name: 'Vajrapani' },
              { name: 'Kali' },
              { name: 'Palden Lhamo' },
              { name: 'Kurkula (Red Tara)' },
              { name: 'Ekajati' }
            ]
          },
          {
            name: 'Historical Masters',
            children: [
              { name: 'Guru Padmasambhava' },
              { name: 'Milarepa' },
              { name: 'Tsongkhapa' },
              { name: 'Karmapa' },
              { name: 'Machig Labdron' }
            ]
          }
        ]
      },
      {
        name: 'Mandalas',
        children: [
          {
            name: 'Spiritual Geometry',
            children: [
              { name: 'Mantra Mandala' },
              { name: 'Kalachakra Mandala' },
              { name: 'Shree Yantra' },
              { name: 'Lotus Mandala' }
            ]
          },
          {
            name: 'Cosmic & Body',
            children: [
              { name: 'Cosmos Mandala' },
              { name: 'Chakra Body' },
              { name: 'Astrological Calendar (Tibetan Calendar)' }
            ]
          },
          {
            name: 'Divine Mandalas',
            children: [
              { name: 'Deity Mandalas' },
              { name: 'Bodhisattva Mandala' }
            ]
          }
        ]
      },
      {
        name: 'Stories & Symbols',
        children: [
          {
            name: 'The Buddha\'s Journey',
            children: [{ name: 'Buddha Life Story' }]
          },
          {
            name: 'Philosophical',
            children: [
              { name: 'Wheel of Life (Ridok)' },
              { name: 'Way to Heaven' }
            ]
          },
          {
            name: 'Auspicious Symbols',
            children: [
              { name: 'Four Friends' },
              { name: 'Ganesh' },
              { name: 'Auspicious Symbol (Asta Mangal)' }
            ]
          }
        ]
      },
      {
        name: 'Style & Exclusive',
        children: [
          {
            name: 'Traditional Styles',
            children: [
              { name: 'Tibetan Style (Standard)' },
              { name: 'Newari Style (Paubha)' },
              { name: 'Karma Gadri (Minimalist)' }
            ]
          },
          {
            name: 'Premium Finishes',
            children: [
              { name: 'Gold & Silver Leaf Thangka' },
              { name: 'Embroidery Thangka' }
            ]
          },
          { name: 'Ghau (Pocket) Thangka' },
          { name: 'Thangka with Brocade' },
          { name: 'Antique Thangka' }
        ]
      }
    ]
  },
  {
    name: 'Singing Bowls',
    children: [
      {
        name: 'Premium Hand-Made',
        children: [
          { name: 'Full Moon & Antique Bowls' },
          { name: 'Chakra Sets (7-Bowl Sets)' }
        ]
      },
      {
        name: 'Specialty',
        children: [
          { name: 'Fire Bowl' },
          { name: 'Lingam Bowl' },
          { name: 'Head Bowl' },
          { name: 'Knee Bowl' }
        ]
      },
      {
        name: 'Machine Made',
        children: [
          { name: 'Etched & Carved Designs' },
          { name: 'Japanese Set' },
          { name: 'Chinese God Designs' }
        ]
      },
      {
        name: 'Healing Instruments',
        children: [
          { name: 'Tingcha' },
          { name: 'Healing Bells' },
          { name: 'Vajra' }
        ]
      }
    ]
  },
  { name: 'Oil Painting' },
  { name: 'Statues' },
  {
    name: 'Jewellery & Accessories',
    children: [
      {
        name: 'Sacred Malas',
        children: [
          { name: 'Bodhi Chitta' },
          { name: 'Rudraksha' },
          { name: 'Lotus Seed' }
        ]
      },
      {
        name: 'Gemstone Jewelry',
        children: [
          { name: 'Jade & Emerald pieces' },
          { name: 'Bracelets' },
          { name: 'Lockets' }
        ]
      },
      {
        name: 'Ritual & Decor',
        children: [
          { name: 'High-quality Incense' },
          { name: 'Prayer Flags' }
        ]
      }
    ]
  }
];

const seedRecursive = async (hierarchy, parentId = null, ancestors = []) => {
  let createdCount = 0;
  const map = {};
  for (const item of hierarchy) {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const category = await Category.create({
      name: item.name,
      parent: parentId,
      ancestors: ancestors,
      slug: slug
    });
    createdCount++;
    map[item.name] = category._id;
    if (item.children && item.children.length > 0) {
      const { count, childMap } = await seedRecursive(item.children, category._id, [...ancestors, category._id]);
      createdCount += count;
      Object.assign(map, childMap);
    }
  }
  return { count: createdCount, childMap: map };
};

const products = [
  {
    name: 'Reduk Wheel of Life',
    description: `
      <p>A magnificent hand-painted Thangka depicting the Wheel of Life (Bhavachakra), representing the cycle of existence in Buddhist cosmology. This piece features intricate details and vibrant colors, painted by master artisans using traditional mineral pigments and 24K gold.</p>
      <h3>Specifications</h3>
      <ul>
        <li><strong>Material:</strong> Cotton canvas, mineral pigments, 24K gold</li>
        <li><strong>Origin:</strong> Kathmandu, Nepal</li>
        <li><strong>Style:</strong> Traditional Karma Gadri</li>
      </ul>
    `,
    category: 'Wheel of Life (Ridok)',
    tags: ['thangka', 'buddhist art', 'wheel of life', 'traditional', 'artisan-selection'],
    isFeatured: true,
    variants: [
      {
        size: 'Standard (24" x 36")',
        price: 250,
        originalPrice: 500,
        discount: 50,
        stock: 5,
        isActive: true
      },
      {
        size: 'Large Masterpiece (36" x 48")',
        price: 850,
        stock: 2,
        isActive: true
      }
    ],
    // Fallback values derived from first/default variant
    price: 250,
    originalPrice: 500,
    discount: 50,
    stock: 7,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
        alt: 'Reduk Wheel of Life Full View',
      },
      {
        url: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=800',
        alt: 'Detail View',
      }
    ],
    rating: 4.8,
    numReviews: 12,
  },
  {
    name: 'Medicine Buddha Statue',
    description: `
      <p>Exquisite Medicine Buddha statue, masterfully crafted in Patan, Nepal. The Medicine Buddha is known for healing physical and mental ailments.</p>
      <p>Available in two distinct finishes: <strong>Oxidized Copper</strong> for a vintage look, and <strong>Full Gold Gilded</strong> for a radiant, divine presence.</p>
    `,
    category: 'Statues',
    tags: ['statue', 'buddha', 'healing', 'artisan-selection'],
    isFeatured: true,
    variants: [
      {
        color: 'Oxidized Copper',
        size: '12 inches',
        price: 350,
        stock: 3,
        isActive: true
      },
      {
        color: 'Gold Gilded',
        size: '12 inches',
        price: 550,
        stock: 2,
        isActive: true
      }
    ],
    price: 350,
    stock: 5,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1615680022647-99c397cbcbdd?w=800',
        alt: 'Medicine Buddha - Bronze/Copper Look',
        color: 'Oxidized Copper'
      },
      {
        url: 'https://images.unsplash.com/photo-1628147828005-59b136894562?w=800',
        alt: 'Medicine Buddha - Gold Look',
        color: 'Gold Gilded'
      }
    ],
    rating: 5.0,
    numReviews: 8,
  },
  {
    name: 'Singing Bowl Set',
    description: `
      <p>Handcrafted Tibetan singing bowl made from seven sacred metals. Produces deep, resonant tones perfect for meditation, healing, and chakra balancing. Includes wooden striker and cushion.</p>
    `,
    category: 'Singing Bowls',
    tags: ['singing bowl', 'meditation', 'sound healing', 'artisan-selection'],
    isFeatured: false,
    variants: [
      {
        size: '6 inches',
        price: 85,
        stock: 15,
        isActive: true
      },
      {
        size: '8 inches',
        price: 120,
        stock: 10,
        isActive: true
      },
      {
        size: '10 inches',
        price: 180,
        stock: 5,
        isActive: true
      }
    ],
    price: 85,
    stock: 30,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?w=800',
        alt: 'Singing Bowl Set',
      }
    ],
    rating: 4.7,
    numReviews: 24,
  },
  {
    name: 'Green Tara Thangka',
    description: '<p>The Mother of all Buddhas, Green Tara represents the active compassion of all Buddhas. She is ready to step down from her lotus throne to help sentient beings.</p>',
    category: 'Green Tara',
    tags: ['thangka', 'green tara', 'compassion', 'artisan-selection'],
    isFeatured: false,
    variants: [
      {
        size: 'Standard (18" x 24")',
        price: 180,
        stock: 5
      }
    ],
    price: 180,
    stock: 5,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=800',
        alt: 'Green Tara Thangka'
      }
    ]
  },
  {
    name: 'Vajra & Bell Set',
    description: '<p>Essential ritual implements for Vajrayana practice. Representing method (Vajra) and wisdom (Bell).</p>',
    category: 'Ritual & Decor',
    tags: ['ritual', 'vajra', 'bell', 'artisan-selection'],
    variants: [],
    price: 65,
    stock: 20,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?w=800',
        alt: 'Vajra and Bell'
      }
    ]
  },
  {
    name: 'Silk Brocade Frame',
    description: '<p>Traditional silk brocade for framing Thangkas. Protects the artwork and enhances its sacred beauty.</p>',
    category: 'Thangka with Brocade',
    tags: ['brocade', 'silk', 'frame', 'artisan-selection'],
    variants: [
      { color: 'Red & Gold', price: 45, stock: 10 },
      { color: 'Blue & Gold', price: 45, stock: 10 },
      { color: 'Yellow & Gold', price: 45, stock: 10 }
    ],
    price: 45,
    stock: 30,
    images: [
      { url: 'https://images.unsplash.com/photo-1614959541559-4f94441a547d?w=800', alt: 'Red Brocade', color: 'Red & Gold' },
      { url: 'https://images.unsplash.com/photo-1614959541818-6cd5e4j847d?w=800', alt: 'Blue Brocade', color: 'Blue & Gold' }
    ]
  },
  {
    name: 'Tibetan Prayer Flags',
    category: 'Prayer Flags',
    description: '<p>5-meter string of cotton prayer flags. Woodblock printed with Lungta (Wind Horse) and mantras.</p>',
    tags: ['prayer flags', 'tibetan', 'artisan-selection'],
    price: 15,
    stock: 100,
    images: [{ url: 'https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?w=800', alt: 'Prayer Flags' }]
  },
  {
    name: 'Mandala Oil Painting',
    category: 'Oil Painting',
    description: '<p>Contemporary style Mandala oil painting. A fusion of traditional sacred geometry and modern art medium.</p>',
    tags: ['oil painting', 'mandala', 'art', 'artisan-selection'],
    price: 420,
    stock: 1,
    variants: [
      { size: '36" x 36"', price: 420, stock: 1 }
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', alt: 'Mandala Art' }]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    console.log('🗑️  Data cleared');

    // Insert categories recursively
    const { count, childMap } = await seedRecursive(categoryHierarchy);
    console.log(`📂 ${count} Categories seeded`);

    // Insert users
    for (const user of users) {
      await User.create(user);
    }
    console.log('👤 Users seeded');

    // Update products with category IDs
    const productsWithIds = products.map((product) => ({
      ...product,
      category: childMap[product.category] || null,
    }));

    // Insert products
    await Product.insertMany(productsWithIds);
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
