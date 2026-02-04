import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
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

  // Tracking debounce timeouts for each item
  const debounceTimers = useRef({});

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

    // Cleanup timers on unmount
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
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

  // Internal sync function for debounced updates
  const syncQuantityWithBackend = async (itemId, quantity, previousCart) => {
    try {
      const response = await api.put(`/cart/${itemId}`, { quantity });
      // NOTE: We don't necessarily want to call setCart(response.data) here 
      // if another update has happened locally in the meantime.
      // Instead, we just trust the local state unless there's an error.
    } catch (apiError) {
      console.error('Sync failed, reverting:', apiError);
      setCart(previousCart);
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1, variant = null) => {
    try {
      if (!product) return false;
      const productId = product._id || product.id;

      if (isAuthenticated) {
        const payload = {
          productId,
          quantity,
          size: variant?.size,
          color: variant?.color
        };
        const response = await api.post('/cart', payload);
        setCart(response.data);
      } else {
        // Guest cart logic
        const existingItemIndex = cart.items.findIndex(
          (item) =>
            (item.product._id === productId || item.product.id === productId) &&
            item.size === variant?.size &&
            item.color === variant?.color
        );

        let updatedCart;
        if (existingItemIndex > -1) {
          updatedCart = {
            ...cart,
            items: cart.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity } // Price update logic optionally here
                : item
            ),
          };
        } else {
          // Prepare new item
          const newItem = {
            product: product,
            quantity,
            size: variant?.size,
            color: variant?.color,
            price: variant?.price || product.price,
            // Generate a temp ID for frontend key
            _id: 'guest_' + Date.now() + Math.random()
          };

          updatedCart = {
            ...cart,
            items: [...cart.items, newItem],
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
  const updateCartItem = (itemId, quantity) => {
    if (quantity < 1) return;

    // 1. CAPTURE CURRENT STATE for potential revert
    const previousCart = { ...cart };

    // 2. OPTIMISTIC UPDATE (Instant UI feedback)
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      )
    }));

    if (isAuthenticated) {
      // 3. DEBOUNCED SYNC
      if (debounceTimers.current[itemId]) {
        clearTimeout(debounceTimers.current[itemId]);
      }

      debounceTimers.current[itemId] = setTimeout(() => {
        syncQuantityWithBackend(itemId, quantity, previousCart);
        delete debounceTimers.current[itemId];
      }, 500); // 500ms debounce
    } else {
      // Guest mode - update local storage immediately
      const updatedItems = cart.items.map((item) =>
        (item._id === itemId) ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify({ ...cart, items: updatedItems }));
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      if (isAuthenticated) {
        const previousCart = { ...cart };

        // Optimistic Remove
        setCart(prev => ({
          ...prev,
          items: prev.items.filter(item => item._id !== itemId)
        }));

        try {
          await api.delete(`/cart/${itemId}`);
        } catch (apiError) {
          console.error('Remove failed, reverting:', apiError);
          setCart(previousCart);
          return false;
        }
      } else {
        // Use _id (frontend generated for guest)
        const updatedCart = {
          ...cart,
          items: cart.items.filter((item) => item._id !== itemId),
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
      (total, item) => total + (item.price || item.product?.price || 0) * item.quantity,
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
