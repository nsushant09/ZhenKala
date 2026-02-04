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

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock based on variant if applicable
    let stockAvailable = product.stock;
    let price = product.price;

    if (size || color) {
      // Find matching variant
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

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity, size, color, price }],
      });
    } else {
      // Check if product with SAME variant already in cart
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.size == size &&
          item.color == color
      );

      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;

        // Check stock again including current cart quantity
        if (stockAvailable < cart.items[itemIndex].quantity) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        // Update price in case it changed
        cart.items[itemIndex].price = price;
      } else {
        // Add new item
        cart.items.push({ product: productId, quantity, size, color, price });
      }

      await cart.save();
    }

    cart = await cart.populate('items.product');
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params; // NOTE: Ideally this should be item ID, but using productId for now assuming unique per user+product combo is tricky. 
    // Actually, distinct variants = distinct items. We need to identify WHICH item.
    // For now, let's assume the frontend passes the Cart Item ID in the route or body if possible.
    // BUT the route is /:productId. This is ambiguous if user has same product with diff variants.
    // To support variants properly, we should really be operating on CART ITEM ID.
    // For this refactor, I will change the logic to find item by _id if passed, OR try to match product + variant from body? 
    // Simplest: Identify by Cart Item Subdocument ID.

    // Changing params: productId -> itemId
    const itemId = productId; // Treating the param as cart item ID for better precision

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    // If not found by Item ID, try Product ID (fallback for legacy/simple items)
    // But this risks updating the wrong variant.

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const cartItem = cart.items[itemIndex];
    // Check stock
    const product = await Product.findById(cartItem.product);

    let stockAvailable = product.stock;
    if (cartItem.size || cartItem.color) {
      const variant = product.variants.find(v =>
        (v.size == cartItem.size || (!v.size && !cartItem.size)) &&
        (v.color == cartItem.color || (!v.color && !cartItem.color))
      );
      if (variant) stockAvailable = variant.stock;
    }

    if (stockAvailable < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const updatedCart = await cart.populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params; // Treating as itemId
    const itemId = productId;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Filter by Item ID
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );

    // Fallback: If no item removed (maybe loose productId passed?), try removing by productId 
    // BUT only if we are sure. Safer to stick to ItemId. 
    // Frontend must pass Item._id

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
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
