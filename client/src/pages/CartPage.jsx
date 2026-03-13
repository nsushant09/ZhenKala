import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

const CartPage = () => {
  const { cart, removeFromCart, updateCartItem, loading } = useCart();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
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
      {/* Header Section */}
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
          <div className="empty-cart-view flex flex-col items-center justify-center py-32 text-center animate-fade-in bg-white/30 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm max-w-4xl mx-auto">
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
              <div className="cart-header-row hidden sm:grid grid-cols-12 gap-4 pb-6 border-b border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-4">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-white/5">
                {cart.items.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveClick}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary Side */}
            <CartSummary />
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
