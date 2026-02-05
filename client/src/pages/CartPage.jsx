import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';

const CartPage = () => {
  const { cart, removeFromCart, updateCartItem, getCartTotal, loading } = useCart();
  const navigate = useNavigate();

  const subtotal = getCartTotal();

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeFromCart(itemId);
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
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-secondary mb-12">
        <img
          src="/about-us-header.jpg"
          alt="Shopping Cart"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="font-secondary text-5xl md:text-7xl lg:text-8xl mb-2 garamond">Your Cart</h1>
          <p className="text-primary text-lg tracking-widest uppercase opacity-90">Review your selections</p>
        </div>
      </section>

      <div className="container mx-auto px-4">

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
              <FiShoppingBag className="w-10 h-10 text-secondary" />
            </div>
            <h2 className="text-3xl font-secondary mb-3 text-on-surface garamond">Your bag is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Explore our collection of authentic handicrafts and find something unique for yourself.
            </p>
            <Link
              to="/products"
              style={{ color: "white" }}
              className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all hover:px-10 duration-300 shadow-md"
            >
              Start Shopping <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16 mt-8">
            {/* Cart Items List */}
            <div className="flex-grow">
              {/* Table Header (Desktop) */}
              <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-gray-300 text-sm font-semibold text-gray-400 uppercase tracking-wider px-6">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => {
                  if (!item) return null;
                  const product = item.product || {};
                  const price = item.price || product.price || 0;
                  const itemTotal = price * item.quantity;
                  const itemId = item._id;
                  if (!itemId) return null;

                  return (
                    <div
                      key={itemId}
                      className="py-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center group px-6 transition-colors"
                    >
                      {/* Product Info */}
                      <div className="col-span-1 sm:col-span-6 flex gap-6">
                        <Link to={`/products/${product._id}`} className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden shadow-sm relative">
                          <img
                            src={product.images && product.images[0]?.url ? product.images[0].url : '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </Link>
                        <div className="flex flex-col justify-between py-1">
                          <div>
                            <Link to={`/products/${product._id}`} className="font-secondary text-xl text-on-surface hover:text-secondary transition-colors block mb-2 garamond">
                              {product.name}
                            </Link>
                            <div className="text-sm text-gray-500 space-y-1">
                              {item.size && <div className="flex items-center gap-2"><span className="w-12 text-xs font-bold uppercase tracking-wider text-gray-400">Size</span> {item.size}</div>}
                              {item.color && <div className="flex items-center gap-2"><span className="w-12 text-xs font-bold uppercase tracking-wider text-gray-400">Color</span> {item.color}</div>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(itemId)}
                            className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 text-sm w-fit mt-2"
                          >
                            <FiTrash2 /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 sm:col-span-2 sm:text-center text-lg font-medium text-gray-600 hidden sm:block">
                        ${price.toLocaleString()}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1 sm:col-span-2 flex sm:justify-center">
                        <div className="flex items-center border border-gray-300 rounded-full px-2 py-1 bg-white">
                          <button
                            onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center hover:text-secondary disabled:opacity-30 transition-colors"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium text-on-surface">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:text-secondary transition-colors"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-1 sm:col-span-2 sm:text-right font-bold text-lg text-secondary flex items-center justify-between sm:block">
                        <span className="sm:hidden text-gray-500 font-normal">Total:</span>
                        ${itemTotal.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-[400px] flex-shrink-0">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 sticky top-32">
                <h3 className="font-secondary text-2xl mb-6 text-on-surface garamond">Order Summary</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-on-surface">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Estimate</span>
                    <span className="text-sm italic text-gray-400">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-2xl mb-8 text-on-surface items-center">
                  <span>Total</span>
                  <span className="text-secondary">${subtotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-secondary text-primary py-4 rounded-md font-bold text-lg flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Checkout <FiArrowRight />
                </button>

                <div className="mt-6 flex flex-col items-center gap-2 text-xs text-gray-400 text-center">
                  <p>Secure Checkout - SSL Encrypted</p>
                  <div className="flex gap-2 grayscale opacity-50">
                    {/* Placeholder for payment icons if needed later */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
