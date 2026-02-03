const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, rating, search, sort, page = 1, limit = 12 } = req.query;

    // Build query
    let query = { isActive: true };

    if (category && category !== 'all') {
      let categoryIds = [];
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryIds = [new mongoose.Types.ObjectId(category)];
      } else {
        const categoryDoc = await Category.findOne({ name: { $regex: `^${category}$`, $options: 'i' } });
        if (categoryDoc) {
          categoryIds = [categoryDoc._id];
        }
      }

      if (categoryIds.length > 0) {
        const descendants = await Category.find({ ancestors: categoryIds[0] });
        const descendantIds = descendants.map(d => d._id);
        query.category = { $in: [...categoryIds, ...descendantIds] };
      } else {
        query.category = new mongoose.Types.ObjectId();
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Sort
    let sortBy = {};
    if (sort === 'price-low') sortBy.price = 1;
    else if (sort === 'price-high') sortBy.price = -1;
    else if (sort === 'rating') sortBy.rating = -1;
    else if (sort === 'newest') sortBy.createdAt = -1;
    else sortBy.createdAt = -1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .sort(sortBy)
      .limit(limitNum)
      .skip(skip)
      .populate('category', 'name slug parent ancestors');

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug parent ancestors');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      product[key] = req.body[key];
    });

    // Trigger pre('save') hooks for validation and sync
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      name: req.body.name || req.user.name || req.user.firstName,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get similar products
// @route   GET /api/products/:id/similar
// @access  Public
exports.getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find products in the same category, excluding the current product
    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(8)
      .populate('category', 'name slug');

    res.json(similarProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
