import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useCart } from './CartContext';
import { useCurrency } from './CurrencyContext';
import api from '../services/api';

const CheckoutContext = createContext();

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
};

export const CheckoutProvider = ({ children }) => {
    const { cart, getCartTotal } = useCart();
    const { selectedCurrency, convert, currencies } = useCurrency();

    // 1. Core State
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. Calculated Totals
    const [totals, setTotals] = useState({
        subtotal: 0,
        shipping: 0,
        total: 0,
        displaySubtotal: 0,
        displayShipping: 0,
        displayTotal: 0,
        currency: selectedCurrency,
        rate: 1
    });

    // 3. Totals Logic
    const calculateTotals = useCallback(() => {
        const baseSubtotal = getCartTotal();
        const baseShipping = baseSubtotal > 0 && baseSubtotal < 100 ? 15 : 0;
        const baseTotal = baseSubtotal + baseShipping;

        const convertedSubtotal = convert(baseSubtotal);
        const convertedShipping = convert(baseShipping);
        const convertedTotal = convertedSubtotal + convertedShipping;

        const currentRate = baseSubtotal === 0 ? 1 : convertedSubtotal / baseSubtotal;

        setTotals({
            subtotal: baseSubtotal,
            shipping: baseShipping,
            total: baseTotal,
            displaySubtotal: convertedSubtotal,
            displayShipping: convertedShipping,
            displayTotal: convertedTotal,
            currency: selectedCurrency,
            rate: currentRate
        });
    }, [getCartTotal, convert, selectedCurrency]);

    useEffect(() => {
        calculateTotals();
    }, [calculateTotals, cart.items]);

    // 4. Persistence & Profile Load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const { data: profile } = await api.get('/users/profile');
                if (profile.address) {
                    setShippingAddress(prev => ({
                        ...prev,
                        ...profile.address
                    }));
                }
            } catch (err) {
                console.warn('Could not load user profile for checkout');
            }
        };
        loadInitialData();
    }, []);

    // 5. Delivery Estimation
    const deliveryEstimate = useMemo(() => {
        const isNepal = shippingAddress.country?.trim().toLowerCase() === 'nepal' ||
            /^\d{5}$/.test(shippingAddress.zipCode?.trim());
        const days = isNepal ? 5 : 15;
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date;
    }, [shippingAddress.country, shippingAddress.zipCode]);

    // 6. Actions
    const updateAddress = (newAddress) => {
        setShippingAddress(prev => ({ ...prev, ...newAddress }));
    };

    const createOrder = async () => {
        setLoading(true);
        setError(null);
        try {
            const orderData = {
                orderItems: cart.items.map(item => ({
                    product: item.product?._id || item.product?.id || item.product,
                    variant: item.variantId,
                    name: item.product?.name || item.name,
                    quantity: item.quantity,
                    image: item.product?.images?.[0]?.url || item.image || '',
                    price: (item.price || item.product?.price || 0) * totals.rate,
                    size: item.size,
                    color: item.color
                })),
                shippingAddress,
                paymentMethod: 'processing',
                itemsPrice: totals.displaySubtotal,
                shippingPrice: totals.displayShipping,
                totalPrice: totals.displayTotal,
                currency: totals.currency,
                estimatedDeliveryDate: deliveryEstimate
            };

            const { data: order } = await api.post('/orders', orderData);
            setCreatedOrderId(order._id);
            setStep(2);
            return order;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create order. Please try again.';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const resetCheckout = useCallback(() => {
        setStep(1);
        setCreatedOrderId(null);
        setError(null);
    }, []);

    const value = useMemo(() => ({
        step,
        setStep,
        shippingAddress,
        updateAddress,
        paymentMethod,
        setPaymentMethod,
        totals,
        deliveryEstimate,
        createOrder,
        createdOrderId,
        loading,
        setLoading,
        error,
        setError,
        resetCheckout
    }), [step, shippingAddress, paymentMethod, totals, deliveryEstimate, createdOrderId, loading, error, resetCheckout]);

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
};
