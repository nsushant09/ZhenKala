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

// --- REDUCER ARCHITECTURE ---

const initialState = {
  items: [],
  loading: false,
  initialized: false,
  localVersion: 0, // Incremented on every local user action
  lastSyncedVersion: 0, // The localVersion that was last successfully accepted by the server
  appliedCoupon: null, // Track coupon separately
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'INIT_CART':
      return {
        ...state,
        items: action.payload || [],
        initialized: true,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'OPTIMISTIC_UPDATE': {
      const { itemId, quantity, product, variant, isNew } = action.payload;
      let newItems;

      if (isNew) {
        newItems = [...state.items, {
          _id: itemId,
          product,
          quantity,
          variantId: variant?._id || variant?.id,
          size: variant?.size,
          color: variant?.color,
          price: variant?.price || product.price
        }];
      } else {
        newItems = state.items.map(item =>
          item._id === itemId ? { ...item, quantity } : item
        );
      }

      return {
        ...state,
        items: newItems,
        localVersion: state.localVersion + 1
      };
    }

    case 'OPTIMISTIC_REMOVE':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
        localVersion: state.localVersion + 1
      };

    case 'OPTIMISTIC_CLEAR':
      return {
        ...state,
        items: [],
        localVersion: state.localVersion + 1,
        lastSyncedVersion: state.localVersion + 1 // Burn previous syncs to prevent "undelete" race condition
      };

    case 'SYNC_WITH_SERVER': {
      const { serverCart, syncedVersion } = action.payload;

      // BI-DIRECTIONAL CONFLICT RESOLUTION:
      // If our local version has moved past the version that triggered this sync,
      // we only adopt server values for items we haven't touched recently.

      const isStale = state.localVersion > syncedVersion;

      if (!isStale) {
        return {
          ...state,
          items: serverCart.items || [],
          lastSyncedVersion: syncedVersion
        };
      }

      // --- Bi-directional Merge (Stale State) ---
      // Goal: Keep local quantities for anything touched, but adopt server metadata (prices/ids).
      // Crucially: Don't drop items that exist locally but haven't reached the server yet.

      const localItems = [...state.items];
      const serverItems = serverCart.items || [];

      const mergedItems = serverItems.map(serverItem => {
        const siId = serverItem.product?._id || serverItem.product?.id || serverItem.product;

        // Find if we have a local version of this item
        const localIdx = localItems.findIndex(li => {
          const liId = li.product?._id || li.product?.id || li.product;
          return liId === siId && li.size === serverItem.size && li.color === serverItem.color;
        });

        if (localIdx > -1) {
          const localItem = localItems[localIdx];
          localItems.splice(localIdx, 1); // Remove from pool so we don't duplicate
          return { ...serverItem, quantity: localItem.quantity }; // Keep local intent, server metadata
        }
        return serverItem; // Server only item (from another session)
      });

      // Add back any items that were ONLY in local state (newly added)
      return {
        ...state,
        items: [...mergedItems, ...localItems],
        lastSyncedVersion: syncedVersion
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

// --- PROVIDER ---

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();
  const syncTimerRef = useRef(null);
  const stateRef = useRef(state);

  // Keep stateRef fresh for callbacks without closure staleness
  useEffect(() => {
    stateRef.current = state;
    if (state.initialized) {
      localStorage.setItem('cart', JSON.stringify({ items: state.items, version: state.localVersion }));
    }
  }, [state]);

  // --- API SYNC LOGIC ---

  const refreshCart = useCallback(async (silent = false) => {
    if (!isAuthenticated) return;
    try {
      if (!silent) dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get('/cart');
      dispatch({
        type: 'SYNC_WITH_SERVER',
        payload: { serverCart: response.data, syncedVersion: stateRef.current.localVersion }
      });
    } catch (error) {
      console.error('[CartContext] Fetch failed:', error);
    } finally {
      if (!silent) dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated]);

  const syncToBackend = useCallback(async () => {
    if (!isAuthenticated) return;

    // Capture the exact intent we are syncing
    const versionAtStart = stateRef.current.localVersion;
    const itemsToSync = stateRef.current.items;

    try {
      const formattedItems = itemsToSync.map(item => ({
        productId: item.product?._id || item.product?.id || item.product,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }));

      // Use the sync endpoint to synchronize current state exactly as intended
      const response = await api.post('/cart/sync', { items: formattedItems });

      dispatch({
        type: 'SYNC_WITH_SERVER',
        payload: { serverCart: response.data, syncedVersion: versionAtStart }
      });
    } catch (error) {
      console.error('[CartContext] Sync failed:', error);
      // Wait for next trigger or manual refresh
    }
  }, [isAuthenticated]);

  const triggerSync = useCallback(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(syncToBackend, 800); // 800ms group delay
  }, [syncToBackend]);

  // Init logic: Merge guest -> Auth or just Load Local
  useEffect(() => {
    const initialize = async () => {
      const localData = localStorage.getItem('cart');
      let localCart = { items: [] };
      try {
        if (localData) localCart = JSON.parse(localData);
      } catch (e) {
        console.error('Local cart corrupted');
      }

      if (isAuthenticated) {
        if (localCart.items && localCart.items.length > 0) {
          try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const formattedItems = localCart.items.map(item => ({
              productId: item.product?._id || item.product?.id || item.product,
              quantity: item.quantity,
              size: item.size,
              color: item.color
            }));
            const response = await api.post('/cart/merge', { items: formattedItems });
            dispatch({ type: 'INIT_CART', payload: response.data.items });
            localStorage.removeItem('cart');
          } catch (e) {
            refreshCart();
          } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          refreshCart();
        }
      } else {
        dispatch({ type: 'INIT_CART', payload: localCart.items || [] });
      }
    };
    initialize();
  }, [isAuthenticated, refreshCart]);

  // --- EXPOSED ACTIONS ---

  const getAvailableStock = useCallback((product, variant = null) => {
    if (!product) return 0;

    if (variant?.size || variant?.color) {
      const matchedVariant = (product.variants || []).find(v =>
        (v.size == variant.size || (!v.size && !variant.size)) &&
        (v.color == variant.color || (!v.color && !variant.color))
      );
      if (matchedVariant) return Number(matchedVariant.stock) || 0;
    }

    return Number(product.stock) || 0;
  }, []);

  const addToCart = useCallback(async (product, quantity = 1, variant = null) => {
    const productId = product._id || product.id;

    const maxStock = getAvailableStock(product, variant);

    const existingItem = stateRef.current.items.find(item =>
      (item.product?._id || item.product?.id || item.product) === productId &&
      item.size === variant?.size &&
      item.color === variant?.color
    );

    const requestedQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    if (requestedQuantity > maxStock) {
      return {
        success: false,
        code: 'STOCK_LIMIT',
        stock: maxStock,
        message: `Only ${maxStock} items are available`
      };
    }

    if (existingItem) {
      dispatch({
        type: 'OPTIMISTIC_UPDATE',
        payload: { itemId: existingItem._id, quantity: existingItem.quantity + quantity }
      });
    } else {
      const tempId = 'temp_' + Date.now();
      dispatch({
        type: 'OPTIMISTIC_UPDATE',
        payload: { itemId: tempId, quantity, product, variant, isNew: true }
      });
    }

    if (isAuthenticated) triggerSync();
    return { success: true };
  }, [getAvailableStock, isAuthenticated, triggerSync]);

  const updateCartItem = useCallback((itemId, quantity) => {
    if (quantity < 1) return;

    const currentItem = stateRef.current.items.find(item => item._id === itemId);
    if (!currentItem) {
      return { success: false, message: 'Item not found in cart' };
    }

    const product = currentItem.product || {};
    const maxStock = getAvailableStock(product, {
      size: currentItem.size,
      color: currentItem.color
    });

    if (quantity > maxStock) {
      return {
        success: false,
        code: 'STOCK_LIMIT',
        stock: maxStock,
        message: `Only ${maxStock} items are available.`
      };
    }

    dispatch({ type: 'OPTIMISTIC_UPDATE', payload: { itemId, quantity } });
    if (isAuthenticated) triggerSync();
    return { success: true };
  }, [getAvailableStock, isAuthenticated, triggerSync]);

  const removeFromCart = useCallback(async (itemId) => {
    dispatch({ type: 'OPTIMISTIC_REMOVE', payload: itemId });
    if (isAuthenticated) triggerSync();
    return true;
  }, [isAuthenticated, triggerSync]);

  const removeMultipleFromCart = useCallback(async (itemIds) => {
    if (!itemIds?.length) return true;
    itemIds.forEach(id => dispatch({ type: 'OPTIMISTIC_REMOVE', payload: id }));
    if (isAuthenticated) triggerSync();
    return true;
  }, [isAuthenticated, triggerSync]);

  const clearCart = useCallback(async () => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    dispatch({ type: 'OPTIMISTIC_CLEAR' });
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (e) {
        console.error('Server clear failed');
        refreshCart();
      }
    } else {
      localStorage.removeItem('cart');
    }
  }, [isAuthenticated, refreshCart]);

  const getCartTotal = useCallback(() => {
    return state.items.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [state.items]);

  const getCartCount = useCallback(() => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  }, [state.items]);

  const value = useMemo(() => ({
    cart: { items: state.items },
    loading: state.loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    removeMultipleFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    refreshCart,
    applyCoupon: (coupon) => dispatch({ type: 'SET_COUPON', payload: coupon }),
    clearCoupon: () => dispatch({ type: 'CLEAR_COUPON' }),
    appliedCoupon: state.appliedCoupon
  }), [state.items, state.loading, state.appliedCoupon, addToCart, updateCartItem, removeFromCart, removeMultipleFromCart, clearCart, getCartTotal, getCartCount, refreshCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
