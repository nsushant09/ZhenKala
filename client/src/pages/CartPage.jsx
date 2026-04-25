import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag, FiCheckCircle, FiLoader } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import api from '../services/api';

import { useMerchant } from '../context/MerchantContext';

/**
 * Senior Note: CartPage uses optimistic context states.
 * We avoid full-page blockers for small updates to preserve user flow.
 */
const CartPage = () => {
  const { 
    cart, 
    removeFromCart, 
    updateCartItem, 
    getCartTotal, 
    loading, 
    isInitialized,
    applyCoupon, 
    clearCoupon, 
    appliedCoupon 
  } = useCart();
  
  const { formatPrice } = useCurrency();
  const { settings } = useMerchant();
  const navigate = useNavigate();

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Derived Values
  const threshold = settings?.freeShippingThreshold ?? 13000;
  const subtotal = getCartTotal();
  const itemsCount = cart.items.length;
  
  const discountAmount = useMemo(() => 
    appliedCoupon ? (subtotal * (appliedCoupon.discountPercent / 100)) : 0
  , [subtotal, appliedCoupon]);

  const total = subtotal - discountAmount;

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const { data } = await api.post('/coupons/validate', { code: promoCode });
      applyCoupon(data);
      setPromoCode('');
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid or expired coupon code');
      clearCoupon();
    } finally {
      setPromoLoading(false);
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem(itemId, newQuantity);
    // Errors are handled internally in context or as a return value if we wanted alert-style feedback
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
      setShowRemoveModal(false);
    }
  };

  // Senior UI: Only show initial loader, don't block on subsequent syncs
  if (!isInitialized) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing Bag...</p>
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
          <p className="text-white/80 text-[10px] tracking-[0.4em] uppercase font-bold">Refining your artisan collection</p>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-12">
        {itemsCount === 0 ? (
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
              className="inline-flex items-center gap-3 bg-secondary px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-opacity-90 transition-all hover:translate-y-[-2px] duration-300 shadow-xl"
              style={{ color: 'white' }}
            >
              Explore Collection <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 mt-4 relative">
            
            {/* Context Loading Overlay (Subtle) */}
            {loading && (
                <div className="absolute top-0 right-0 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-secondary/5 shadow-lg animate-fade-in pointer-events-none">
                    <FiLoader className="animate-spin text-secondary" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saving Changes</span>
                </div>
            )}

            {/* Cart Items List */}
            <div className="flex-grow">
              <div className="hidden sm:grid grid-cols-12 gap-4 pb-6 border-b border-secondary/10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-4">
                <div className="col-span-6">Artistic Selection</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-secondary/5 overflow-hidden">
                {cart.items.map((item) => {
                  if (!item) return null;
                  const product = item.product || {};
                  const price = item.price || product.price || 0;
                  const itemTotal = price * item.quantity;
                  const itemId = item._id;

                  return (
                    <div
                      key={itemId}
                      className="py-10 grid grid-cols-1 sm:grid-cols-12 gap-8 items-center group px-4 hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-secondary/20"
                    >
                      {/* Product Info */}
                      <div className="col-span-1 sm:col-span-6 flex gap-4 sm:gap-8">
                        <Link to={`/products/${product._id}`} className="w-20 h-28 sm:w-28 sm:h-36 flex-shrink-0 bg-white p-2 rounded-sm shadow-sm relative border border-gray-100 overflow-hidden">
                          <img
                            src={product.images?.[0]?.url || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </Link>
                        <div className="flex flex-col justify-center py-1 min-w-0">
                          <div className="min-w-0">
                            <Link to={`/products/${product._id}`} className="font-secondary text-lg sm:text-2xl text-gray-800 hover:text-secondary transition-colors block mb-1 garamond truncate sm:whitespace-normal">
                              {product.name}
                            </Link>
                            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider space-x-4 mb-4 flex items-center">
                              {item.size && <div className="flex items-center gap-1">Size: <span className="text-gray-600 font-black">{item.size}</span></div>}
                              {item.color && <div className="flex items-center gap-1">Color: <span className="text-gray-600 font-black">{item.color}</span></div>}
                            </div>
                          </div>
                          <button
                            onClick={() => { setItemToRemove(itemId); setShowRemoveModal(true); }}
                            className="text-secondary transition-all duration-300 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider w-fit group/remove hover:scale-105"
                          >
                            <FiTrash2 size={12} /> Remove Choice
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 sm:col-span-2 sm:text-center text-sm font-medium text-gray-400 hidden sm:block">
                        {formatPrice(price)}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1 sm:col-span-2 flex sm:justify-center">
                        <div className="flex flex-col items-start sm:items-center">
                          <div className="flex items-center border border-gray-200 rounded-full bg-white p-1 shadow-inner group/qty transition-all hover:border-secondary/20">
                            <button
                              onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-secondary disabled:opacity-20 transition-colors"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-black text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-secondary transition-colors"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
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
                  
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Delivery</span>
                    <span className={subtotal >= threshold ? "text-green-600 font-black" : ""}>
                      {subtotal >= threshold ? 'COMPLIMENTARY' : 'Calculated at Checkout'}
                    </span>
                  </div>

                  {subtotal < threshold && subtotal > 0 && (
                    <div className="bg-secondary/5 p-4 rounded-sm mt-4 border border-secondary/5">
                       <p className="text-[10px] text-secondary font-bold uppercase tracking-wider text-center leading-relaxed">
                        Add {formatPrice(threshold - subtotal)} more for free shipping
                      </p>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-green-600 bg-green-50/50 p-4 rounded-sm border border-green-100">
                      <span>Discount ({appliedCoupon.discountPercent}%)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Promo Code Input */}
                <div className="mb-8">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={appliedCoupon ? appliedCoupon.code : "Enter code..."}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      disabled={appliedCoupon || promoLoading}
                      className="flex-grow px-4 py-4 bg-white border border-gray-100 rounded-sm text-xs focus:outline-none focus:border-secondary transition-all uppercase tracking-widest shadow-inner"
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={clearCoupon}
                        className="px-6 py-4 bg-red-50 text-red-500 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyPromoCode}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-8 py-4 bg-secondary text-white rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-opacity-95 transition-all disabled:opacity-50 shadow-lg shadow-secondary/10"
                      >
                        {promoLoading ? '...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {promoError && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{promoError}</p>}
                </div>

                <div className="flex justify-between font-bold text-3xl mb-10 text-gray-800 items-baseline">
                  <span className="garamond text-xl">Total Due*</span>
                  <span className="text-secondary">{formatPrice(total)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-secondary text-white py-6 rounded-sm font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-opacity-95 transition-all shadow-2xl shadow-secondary/20 hover:-translate-y-1 active:scale-[0.98]"
                >
                  CHECKOUT <FiArrowRight size={18} />
                </button>

                <div className="mt-10 pt-8 border-t border-secondary/5 flex flex-col items-center gap-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-secondary/40" />
                    <span>Curated Selection Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => { setShowRemoveModal(false); setItemToRemove(null); }}
        onConfirm={confirmRemove}
        title="Remove Item"
        message="Are you sure you want to remove this artistic creation from your collection?"
        confirmText="Remove Selection"
        cancelText="Keep"
      />
    </div>
  );
};

export default CartPage;
