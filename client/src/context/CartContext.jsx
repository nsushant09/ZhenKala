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
    const handleAuthChange = async () => {
      if (isAuthenticated) {
        // Check for guest cart items to merge
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          const parsedLocalCart = JSON.parse(localCart);
          if (parsedLocalCart.items && parsedLocalCart.items.length > 0) {
            await mergeGuestCart(parsedLocalCart.items);
          } else {
            fetchCart();
          }
          localStorage.removeItem('cart');
        } else {
          fetchCart();
        }
      } else {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setCart(JSON.parse(localCart));
        } else {
          setCart({ items: [] });
        }
      }
    };

    handleAuthChange();

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

  // Merge guest cart items with backend cart
  const mergeGuestCart = async (items) => {
    try {
      setLoading(true);
      const formattedItems = items.map(item => ({
        productId: item.product._id || item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }));

      const response = await api.post('/cart/merge', { items: formattedItems });
      setCart(response.data);
    } catch (error) {
      console.error('Error merging cart:', error);
      fetchCart(); // Fallback to just fetching existing cart
    } finally {
      setLoading(false);
    }
  };

  // Internal sync function for debounced updates
  const syncQuantityWithBackend = async (itemId, quantity, previousCart) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
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
      const updatedCart = { ...cart, items: updatedItems };
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
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

  // Remove multiple items from cart
  const removeMultipleFromCart = async (itemIds) => {
    if (!itemIds || itemIds.length === 0) return true;

    try {
      if (isAuthenticated) {
        const previousCart = { ...cart };

        // Optimistic Remove All selected
        setCart(prev => ({
          ...prev,
          items: prev.items.filter(item => !itemIds.includes(item._id))
        }));

        try {
          // Perform parallel deletes
          await Promise.all(itemIds.map(id => api.delete(`/cart/${id}`)));
        } catch (apiError) {
          console.error('Bulk remove failed, fetching fresh cart:', apiError);
          fetchCart(); // Re-fetch to be safe if some failed
          return false;
        }
      } else {
        const updatedCart = {
          ...cart,
          items: cart.items.filter((item) => !itemIds.includes(item._id)),
        };
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      return true;
    } catch (error) {
      console.error('Error removing multiple items:', error);
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
    removeMultipleFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
