import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';

const CartPage = () => {
  const { cart, removeFromCart, updateCartItem, getCartTotal, loading } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [quantityErrors, setQuantityErrors] = useState({});

  const subtotal = getCartTotal();
  // const shipping = subtotal > 0 && subtotal < 100 ? 15 : 0;
  const total = subtotal;

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const result = await updateCartItem(itemId, newQuantity);
    if (result?.success === false && result?.stock !== undefined) {
      setQuantityErrors((prev) => ({
        ...prev,
        [itemId]: `Only ${result.stock} items are available.`
      }));
      return;
    }

    setQuantityErrors((prev) => {
      if (!prev[itemId]) return prev;
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const getItemStock = (item) => {
    const product = item?.product || {};
    const variants = product.variants || [];

    if (item?.size || item?.color) {
      const matchedVariant = variants.find(v =>
        (v.size == item.size || (!v.size && !item.size)) &&
        (v.color == item.color || (!v.color && !item.color))
      );
      if (matchedVariant) return Number(matchedVariant.stock) || 0;
    }

    return Number(product.stock) || 0;
  };

  const handleRemoveClick = (itemId) => {
    setItemToRemove(itemId);
    setShowRemoveModal(true);
  };

  const confirmRemove = async () => {
    if (itemToRemove) {
      await removeFromCart(itemToRemove);
      setShowRemoveModal(false);
      setItemToRemove(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-32 pb-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative h-[30vh] flex items-center justify-center overflow-hidden bg-secondary mb-12">
        <img
          src="/about-us-header.jpg"
          alt="Shopping Cart"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20"></div>
        <div className="relative z-10 text-center">
          <h1 className="font-secondary text-5xl md:text-7xl mb-2 text-white garamond drop-shadow-lg">Your Cart</h1>
          <p className="text-primary text-xs tracking-[0.3em] uppercase opacity-90">Review your selections</p>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-12">

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in bg-white/30 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center mb-6 border border-secondary/10">
              <FiShoppingBag className="w-8 h-8 text-secondary/40" />
            </div>
            <h2 className="text-4xl font-secondary mb-4 text-gray-800 garamond">Your bag is empty</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed">
              Discover unique artisan pieces from the heart of the Himalayas.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-secondary text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-opacity-90 transition-all hover:scale-105 duration-300 shadow-xl"
              style={{ color: "white" }}
            >
              Explore Collection <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 mt-4">
            {/* Cart Items List */}
            <div className="flex-grow">
              <div className="hidden sm:grid grid-cols-12 gap-4 pb-6 border-b border-secondary/10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-4">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-secondary/5">
                {cart.items.map((item) => {
                  if (!item) return null;
                  const product = item.product || {};
                  const price = item.price || product.price || 1;
                  const itemTotal = price * item.quantity;
                  const itemId = item._id;
                  if (!itemId) return null;
                  const itemStock = getItemStock(item);
                  const isAtMaxStock = item.quantity >= itemStock;

                  return (
                    <div
                      key={itemId}
                      className="py-10 grid grid-cols-1 sm:grid-cols-12 gap-8 items-center group px-4 hover:bg-white/10 transition-colors"
                    >
                      {/* Product Info */}
                      <div className="col-span-1 sm:col-span-6 flex gap-8">
                        <Link to={`/products/${product._id}`} className="w-28 h-36 flex-shrink-0 bg-white p-2 rounded-sm shadow-sm relative border border-gray-100 overflow-hidden">
                          <img
                            src={product.images && product.images[0]?.url ? product.images[0].url : '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </Link>
                        <div className="flex flex-col justify-center py-1">
                          <div>
                            <Link to={`/products/${product._id}`} className="font-secondary text-2xl text-gray-800 hover:text-secondary transition-colors block mb-1 garamond">
                              {product.name}
                            </Link>
                            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider space-y-1 mb-4 flex gap-4">
                              {item.size && <div className="flex items-center gap-1">Size: <span className="text-gray-600">{item.size}</span></div>}
                              {item.color && <div className="flex items-center gap-1">Color: <span className="text-gray-600">{item.color}</span></div>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveClick(itemId)}
                            className="text-gray-400 hover:text-secondary transition-colors duration-300 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider w-fit group/remove"
                          >
                            <FiTrash2 size={12} className="group-hover/remove:text-secondary" /> Remove Item
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 sm:col-span-2 sm:text-center text-sm font-medium text-gray-500 hidden sm:block">
                        {formatPrice(price)}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1 sm:col-span-2 flex sm:justify-center">
                        <div className="flex flex-col items-start sm:items-center">
                          <div className="flex items-center border border-gray-200 rounded-full bg-white p-1 w-max">
                            <button
                              onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-secondary disabled:opacity-30 transition-colors"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                              disabled={isAtMaxStock}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-secondary disabled:opacity-30 transition-colors"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>
                          {(quantityErrors[itemId] || (isAtMaxStock && itemStock > 0)) && (
                            <p className="mt-2 text-[11px] font-medium text-red-600 text-center sm:text-left">
                              {quantityErrors[itemId] || `Only ${itemStock} items are available.`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-1 sm:col-span-2 sm:text-right font-bold text-lg text-secondary flex items-center justify-between sm:block">
                        <span className="sm:hidden text-xs text-gray-400 uppercase tracking-widest font-bold">Total:</span>
                        {formatPrice(itemTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-[420px] flex-shrink-0">
              <div className="bg-white/40 backdrop-blur-md p-10 rounded-2xl border border-white/60 shadow-xl sticky top-32">
                <h3 className="font-secondary text-3xl mb-8 text-gray-800 garamond border-b border-secondary/5 pb-4">Order Summary</h3>

                <div className="space-y-5 mb-8 pb-8 border-b border-secondary/5">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-gray-800">{formatPrice(subtotal)}</span>
                  </div>
                  {/* <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Shipping</span>
                    <span className="">
                      {shipping > 0 ? formatPrice(shipping) : <span className="text-secondary">FREE</span>}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="bg-secondary/5 p-4 rounded-lg mt-2">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-wider text-center">
                        Add {formatPrice(100 - subtotal)} more for FREE shipping
                      </p>
                    </div>
                  )} */}
                </div>

                <div className="flex justify-between font-bold text-3xl mb-10 text-gray-800 items-baseline">
                  <span className="garamond text-xl">Total Due</span>
                  <span className="text-secondary">{formatPrice(total)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-secondary text-white py-5 rounded-sm font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all shadow-lg hover:shadow-secondary/20 hover:-translate-y-1 active:scale-[0.98]"
                >
                  Proceed to Checkout <FiArrowRight />
                </button>

                <div className="mt-8 flex flex-col items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center opacity-60">
                  <div className="flex items-center gap-2">
                    <span className="h-[1px] w-8 bg-gray-200"></span>
                    <span>Secure Checkout</span>
                    <span className="h-[1px] w-8 bg-gray-200"></span>
                  </div>
                  <p>Authentic Himalayan Art &nbsp; • &nbsp; ZhenKala</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={confirmRemove}
        title="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CartPage;
