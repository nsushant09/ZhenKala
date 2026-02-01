import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load cart from localStorage for guest users or from API for logged-in users
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    }
  }, [isAuthenticated]);

  // Fetch cart from API (for authenticated users)
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      if (isAuthenticated) {
        const response = await api.post('/cart', { productId, quantity });
        setCart(response.data);
      } else {
        // Guest cart logic
        const existingItemIndex = cart.items.findIndex(
          (item) => item.product._id === productId
        );

        let updatedCart;
        if (existingItemIndex > -1) {
          updatedCart = {
            ...cart,
            items: cart.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          };
        } else {
          // Note: For guest cart, you'd need to fetch product details
          // This is a simplified version
          updatedCart = {
            ...cart,
            items: [...cart.items, { product: { _id: productId }, quantity }],
          };
        }

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    try {
      if (isAuthenticated) {
        const response = await api.put(`/cart/${productId}`, { quantity });
        setCart(response.data);
      } else {
        const updatedCart = {
          ...cart,
          items: cart.items.map((item) =>
            item.product._id === productId ? { ...item, quantity } : item
          ),
        };
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      return true;
    } catch (error) {
      console.error('Error updating cart:', error);
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        const response = await api.delete(`/cart/${productId}`);
        setCart(response.data);
      } else {
        const updatedCart = {
          ...cart,
          items: cart.items.filter((item) => item.product._id !== productId),
        };
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await api.delete('/cart');
      } else {
        localStorage.removeItem('cart');
      }
      setCart({ items: [] });
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  // Calculate cart totals
  const getCartTotal = () => {
    return cart.items.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );
  };

  const getCartCount = () => {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
