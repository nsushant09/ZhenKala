const Product = require('../models/Product');

const getStockErrorMessage = (item, availableStock) => {
  const variantLabel = item.size || item.color
    ? ` (${[item.size, item.color].filter(Boolean).join(' / ')})`
    : '';

  return `Insufficient stock for ${item.name}${variantLabel}. Available: ${availableStock}`;
};

const validateAndDeductOrderStock = async (order, session) => {
  for (const item of order.orderItems) {
    const quantity = Number(item.quantity) || 0;
    if (quantity <= 0) {
      throw new Error(`Invalid quantity for ${item.name}`);
    }

    let variantId = item.variant;

    // Fallback for carts/orders that only carry size/color but not variant id
    if (!variantId && (item.size || item.color)) {
      const productForVariantLookup = await Product.findById(item.product).session(session);
      const matchedVariant = productForVariantLookup?.variants?.find(v =>
        (v.size == item.size || (!v.size && !item.size)) &&
        (v.color == item.color || (!v.color && !item.color))
      );
      if (matchedVariant) {
        variantId = matchedVariant._id;
      }
    }

    if (variantId) {
      const variantResult = await Product.updateOne(
        {
          _id: item.product,
          variants: {
            $elemMatch: {
              _id: variantId,
              stock: { $gte: quantity }
            }
          }
        },
        {
          $inc: {
            'variants.$.stock': -quantity,
            stock: -quantity
          }
        },
        { session }
      );

      if (variantResult.modifiedCount === 0) {
        const freshProduct = await Product.findById(item.product).session(session);
        const freshVariant = freshProduct?.variants?.id(variantId);
        const availableStock = freshVariant ? freshVariant.stock : 0;
        throw new Error(getStockErrorMessage(item, availableStock));
      }
    } else {
      const baseResult = await Product.updateOne(
        {
          _id: item.product,
          stock: { $gte: quantity }
        },
        {
          $inc: { stock: -quantity }
        },
        { session }
      );

      if (baseResult.modifiedCount === 0) {
        const freshProduct = await Product.findById(item.product).session(session);
        const availableStock = freshProduct ? freshProduct.stock : 0;
        throw new Error(getStockErrorMessage(item, availableStock));
      }
    }
  }
};

module.exports = {
  validateAndDeductOrderStock
};
