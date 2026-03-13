import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useCheckout } from '../../context/CheckoutContext';
import { useCurrency } from '../../context/CurrencyContext';
import api from '../../services/api';
import StripePaymentForm from '../payment/StripePaymentForm';
import PayPalPayment from '../payment/PayPalPayment';
import { STRIPE_PUBLIC_KEY, PAYPAL_CLIENT_ID } from '../../config/payment';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const PaymentInterface = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const {
        paymentMethod,
        createdOrderId,
        totals,
        setError,
        loading,
        setLoading
    } = useCheckout();
    const { selectedCurrency } = useCurrency();

    const [clientSecret, setClientSecret] = useState('');
    const [stripeInstance, setStripeInstance] = useState(null);
    const [config, setConfig] = useState({
        stripePublicKey: STRIPE_PUBLIC_KEY,
        paypalClientId: PAYPAL_CLIENT_ID
    });

    // 1. Load Stripe
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/payments/config');
                setConfig(data);
                if (data.stripePublicKey) {
                    const stripe = await loadStripe(data.stripePublicKey);
                    setStripeInstance(stripe);
                }
            } catch (err) {
                console.error('Failed to load payment config', err);
            }
        };
        fetchConfig();
    }, []);

    // 2. Initialize Payment Intent
    useEffect(() => {
        if (!paymentMethod || paymentMethod === 'PayPal' || !createdOrderId) {
            setClientSecret('');
            return;
        }

        const initializeIntent = async () => {
            setLoading(true);
            try {
                let amount = totals.total;
                let currency = selectedCurrency.toLowerCase();

                // Regional handling logic (CNY for Alipay/WeChat)
                if (paymentMethod === 'Alipay' || paymentMethod === 'WeChat Pay') {
                    if (currency !== 'cny' && currency !== 'eur') {
                        const res = await fetch(`https://raw.githubusercontent.com/WoXy-Sensei/currency-api/main/api/USD_CNY.json`);
                        const data = await res.json();
                        amount = totals.total * (data.rate || 7.2);
                        currency = 'cny';
                    }
                }

                const { data } = await api.post('/payments/create-payment-intent', {
                    amount,
                    currency,
                    paymentMethodType: paymentMethod,
                    metadata: { orderId: createdOrderId }
                });

                setClientSecret(data.clientSecret);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to initialize payment gateway.');
            } finally {
                setLoading(false);
            }
        };

        initializeIntent();
    }, [paymentMethod, createdOrderId, totals.total, selectedCurrency, setLoading, setError]);

    const handleSuccess = async () => {
        await clearCart();
        navigate(`/orders/${createdOrderId}?success=true`);
    };

    if (!paymentMethod) return null;

    return (
        <div className="payment-interface mt-8 pt-8 border-t border-white/10 animate-fade-in">
            {paymentMethod === 'PayPal' ? (
                <PayPalScriptProvider options={{ "client-id": config.paypalClientId }}>
                    <PayPalPayment
                        amount={totals.total}
                        orderId={createdOrderId}
                        onSuccess={handleSuccess}
                        onError={setError}
                    />
                </PayPalScriptProvider>
            ) : (
                stripeInstance && clientSecret ? (
                    <Elements stripe={stripeInstance} options={{ clientSecret }}>
                        <StripePaymentForm
                            amount={totals.total} // Form handles internal conversion or formatting
                            orderId={createdOrderId}
                            selectedMethod={paymentMethod}
                            onSuccess={handleSuccess}
                            onError={setError}
                        />
                    </Elements>
                ) : (
                    <div className="py-12 text-center text-gray-400">
                        {loading ? 'Securing transaction...' : 'Preparing payment gateway...'}
                    </div>
                )
            )}
        </div>
    );
};

export default PaymentInterface;
