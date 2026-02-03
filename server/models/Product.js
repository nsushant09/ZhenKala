const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide product category'],
    },
    variants: [
      {
        size: {
          type: String,
          default: null,
        },
        color: {
          type: String,
          default: null,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        originalPrice: {
          type: Number,
          default: 0,
        },
        discount: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        stock: {
          type: Number,
          required: true,
          min: 0,
          default: 0,
        },
        sku: {
          type: String,
          unique: true,
          sparse: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    images: [
      {
        url: String,
        alt: String,
        color: {
          type: String,
          default: null,
        },
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    tags: [String],
    colors: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce Data Consistency and Generate Slug
productSchema.pre('save', function (next) {
  // Sync Base Product with First Active Variant
  if (this.variants && this.variants.length > 0) {
    const activeVariant = this.variants.find(v => v.isActive) || this.variants[0];
    if (activeVariant) {
      this.price = activeVariant.price;
      this.originalPrice = activeVariant.originalPrice || activeVariant.price;
      this.discount = activeVariant.discount;

      // Verify Total Stock matches sum of variants
      const totalStock = this.variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
      this.stock = totalStock;
    }
  }

  // Generate Slug
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
