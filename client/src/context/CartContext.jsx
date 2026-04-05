import React, { createContext, useReducer, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
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

// --- SENIOR ARCHITECTURE: ATOMIC STATE MANAGEMENT ---

const initialState = {
  items: [],
  isLoading: false,
  isInitialized: false,
  pendingActions: 0, // Number of in-flight sync requests
  appliedCoupon: null,
};

/**
 * Senior Note: We use a simplified reducer.
 * Client state is treated as the "Intent".
 * Server state is treated as the "Reality" (Prices, valid IDs, Stock Validation).
 */
function cartReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        items: action.payload,
        isInitialized: true,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'UPDATE_LOCAL_ITEM': {
      const { productId, size, color, quantity, product, variant, isNew } = action.payload;
      let newItems = [...state.items];

      const existingIndex = newItems.findIndex(item => 
        (item.product?._id || item.product?.id || item.product) === productId &&
        item.size === size &&
        item.color === color
      );

      if (existingIndex > -1) {
        if (quantity <= 0) {
          newItems.splice(existingIndex, 1);
        } else {
          newItems[existingIndex] = { ...newItems[existingIndex], quantity };
        }
      } else if (isNew && quantity > 0) {
        newItems.push({
          _id: `temp_${Date.now()}`,
          product: product || { _id: productId },
          quantity,
          size,
          color,
          price: variant?.price || product?.price || 0
        });
      }

      return { ...state, items: newItems };
    }

    case 'REMOVE_LOCAL_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload)
      };

    case 'CLEAR_LOCAL':
      return { ...state, items: [], appliedCoupon: null };

    case 'SYNC_START':
      return { ...state, pendingActions: state.pendingActions + 1 };

    case 'SYNC_END': {
      const { serverItems } = action.payload;
      const nextPending = Math.max(0, state.pendingActions - 1);
      
      // Senior Strategy: If there are more pending actions, don't adopt the server items yet
      // as they represent a stale "Intent". Wait for the final sync to finish.
      if (nextPending > 0) {
        return { ...state, pendingActions: nextPending };
      }

      return {
        ...state,
        items: serverItems || [],
        pendingActions: nextPending
      };
    }

    case 'SET_COUPON':
      return { ...state, appliedCoupon: action.payload };

    case 'CLEAR_COUPON':
      return { ...state, appliedCoupon: null };

    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  
  const syncTimeoutRef = useRef(null);
  const stateRef = useRef(state);

  // Sync stateRef to avoid stale closure in callbacks
  useEffect(() => {
    stateRef.current = state;
    
    // Persistence: Always save to local storage as a safety net
    if (state.isInitialized) {
      localStorage.setItem('cart_v2', JSON.stringify({
        items: state.items,
        user: user?._id || 'guest',
        timestamp: Date.now()
      }));
    }
  }, [state, user]);

  const fetchServerCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/cart');
      dispatch({ type: 'INITIALIZE', payload: data.items || [] });
    } catch (error) {
      console.error('[Cart] Full fetch failed', error);
    }
  }, [isAuthenticated]);

  const performSync = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const itemsToSync = stateRef.current.items.map(item => ({
      productId: item.product?._id || item.product?.id || item.product,
      quantity: item.quantity,
      size: item.size,
      color: item.color
    }));

    try {
      dispatch({ type: 'SYNC_START' });
      // Use /sync for total alignment
      const { data } = await api.post('/cart/sync', { items: itemsToSync });
      dispatch({ type: 'SYNC_END', payload: { serverItems: data.items } });
    } catch (error) {
      console.error('[Cart] Sync failed', error);
      // On failure, we don't dispatch SYNC_END with server items, simply decrementing pending
      dispatch({ type: 'SYNC_END', payload: { serverItems: stateRef.current.items } });
    }
  }, [isAuthenticated]);

  const debounceSync = useCallback(() => {
    if (!isAuthenticated) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(performSync, 1000); // 1s debounce for stability
  }, [isAuthenticated, performSync]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      let localItems = [];
      const stored = localStorage.getItem('cart_v2');
      
      try {
        if (stored) {
          const parsed = JSON.parse(stored);
          // Only adopt local storage if it belongs to current user/guest
          if (parsed.user === (user?._id || 'guest')) {
            localItems = parsed.items || [];
          }
        }
      } catch (e) {
        console.error('Cart parse failed');
      }

      if (isAuthenticated) {
        // Auth flow: If we have local items, merge them first
        if (localItems.length > 0) {
          try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const formatted = localItems.map(item => ({
                productId: item.product?._id || item.product?.id || item.product,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            }));
            const { data } = await api.post('/cart/merge', { items: formatted });
            dispatch({ type: 'INITIALIZE', payload: data.items || [] });
            // Cleanup old storage
            localStorage.removeItem('cart'); 
          } catch (e) {
            await fetchServerCart();
          } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          await fetchServerCart();
        }
      } else {
        // Guest flow: Just use local items
        dispatch({ type: 'INITIALIZE', payload: localItems });
      }
    };

    init();
  }, [isAuthenticated, user, fetchServerCart]);

  // --- PUBLIC ACTIONS ---

  const getStock = useCallback((product, variant = null) => {
    if (!product) return 0;
    if (variant?.size || variant?.color) {
      const match = (product.variants || []).find(v => 
        (v.size == variant.size || (!v.size && !variant.size)) &&
        (v.color == variant.color || (!v.color && !variant.color))
      );
      return match ? (Number(match.stock) || 0) : 0;
    }
    return Number(product.stock) || 0;
  }, []);

  const addToCart = useCallback((product, quantity = 1, variant = null) => {
    const productId = product._id || product.id;
    const size = variant?.size;
    const color = variant?.color;
    const maxStock = getStock(product, variant);

    const existing = stateRef.current.items.find(item => 
      (item.product?._id || item.product?.id || item.product) === productId &&
      item.size === size &&
      item.color === color
    );

    const newQty = (existing?.quantity || 0) + quantity;

    if (newQty > maxStock) {
      return { success: false, message: `Only ${maxStock} units available`, stock: maxStock };
    }

    dispatch({
      type: 'UPDATE_LOCAL_ITEM',
      payload: { productId, size, color, quantity: newQty, product, variant, isNew: !existing }
    });

    debounceSync();
    return { success: true };
  }, [getStock, debounceSync]);

  const updateCartItem = useCallback((itemId, quantity) => {
    const item = stateRef.current.items.find(i => i._id === itemId);
    if (!item) return { success: false };

    const maxStock = getStock(item.product, item);
    const targetQty = Math.max(0, quantity);

    if (targetQty > maxStock) {
      return { success: false, message: `Only ${maxStock} units available`, stock: maxStock };
    }

    const productId = item.product?._id || item.product?.id || item.product;

    dispatch({
      type: 'UPDATE_LOCAL_ITEM',
      payload: { productId, size: item.size, color: item.color, quantity: targetQty }
    });

    debounceSync();
    return { success: true };
  }, [getStock, debounceSync]);

  const removeFromCart = useCallback((itemId) => {
    dispatch({ type: 'REMOVE_LOCAL_ITEM', payload: itemId });
    debounceSync();
  }, [debounceSync]);

  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR_LOCAL' });
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (e) {
        console.error('Remote clear failed');
      }
    }
  }, [isAuthenticated]);

  const getCartTotal = useCallback(() => {
    return state.items.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);
  }, [state.items]);

  const getCartCount = useCallback(() => {
    return state.items.reduce((acc, item) => acc + item.quantity, 0);
  }, [state.items]);

  const value = useMemo(() => ({
    cart: { items: state.items },
    loading: state.isLoading || (state.pendingActions > 0),
    isInitialized: state.isInitialized,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    getStock,
    refreshCart: fetchServerCart,
    appliedCoupon: state.appliedCoupon,
    applyCoupon: (coupon) => dispatch({ type: 'SET_COUPON', payload: coupon }),
    clearCoupon: () => dispatch({ type: 'CLEAR_COUPON' }),
  }), [state, addToCart, updateCartItem, removeFromCart, clearCart, getCartTotal, getCartCount, fetchServerCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
