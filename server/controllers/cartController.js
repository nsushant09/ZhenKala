const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    // 1. Validate Product & Stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let stockAvailable = product.stock;
    let price = product.price;

    if (size || color) {
      const variant = product.variants.find(v =>
        (v.size == size || (!v.size && !size)) &&
        (v.color == color || (!v.color && !color))
      );

      if (variant) {
        stockAvailable = variant.stock;
        price = variant.price;
      }
    }

    if (stockAvailable < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // 2. Find or Create Cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // 3. Update or Add Item
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size == size &&
        item.color == color
    );

    if (existingItemIndex > -1) {
      // Check total quantity after update
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (stockAvailable < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock for updated quantity' });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = price; // Sync price while we are at it
    } else {
      cart.items.push({ product: productId, quantity, size, color, price });
    }

    await cart.save();
    cart = await cart.populate('items.product');
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId: itemId } = req.params; // Item Subdoc ID

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock for this specifc item/variant
    const product = await Product.findById(item.product);
    let stockAvailable = product.stock;

    if (item.size || item.color) {
      const variant = product.variants.find(v =>
        (v.size == item.size || (!v.size && !item.size)) &&
        (v.color == item.color || (!v.color && !item.color))
      );
      if (variant) stockAvailable = variant.stock;
    }

    if (stockAvailable < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await cart.populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId: itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull(itemId);
    await cart.save();

    const updatedCart = await cart.populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
