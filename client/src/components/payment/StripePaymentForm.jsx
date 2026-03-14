import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import api from '../../services/api';

const StripePaymentForm = ({ amount, orderId, selectedMethod, onSuccess, onError, orderSummaryTotals }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const isWallet = selectedMethod === 'Apple Pay' || selectedMethod === 'Google Pay';

    const onConfirm = async (event) => {
        // Handle confirm for Express Checkout (Apple/Google Pay)
        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-success?orderId=${orderId}&from_redirect=true`,
            },
        });

        if (confirmError) {
            await api.put(`/orders/${orderId}/fail`);
            onError(confirmError.message);
        }
    };

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-success?orderId=${orderId}&from_redirect=true`,
            },
            redirect: 'if_required',
        });

        if (error) {
            await api.put(`/orders/${orderId}/fail`);
            onError(error.message);
            setLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                await api.put(`/orders/${orderId}/pay`, {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    update_time: new Date().toISOString(),
                    email_address: paymentIntent.receipt_email || '',
                    paymentMethod: selectedMethod || 'Card / Digital Wallet',
                    orderSummaryTotals
                });
                onSuccess();
            } catch (err) {
                onError('Payment succeeded but failed to update order status.');
            }
        }
    };

    return (
        <div className="stripe-form-container">
            {isWallet ? (
                <ExpressCheckoutElement onConfirm={onConfirm} options={{
                    wallets: {
                        applePay: selectedMethod === 'Apple Pay' ? 'always' : 'never',
                        googlePay: selectedMethod === 'Google Pay' ? 'always' : 'never',
                    }
                }} />
            ) : (
                <form onSubmit={handleSubmit} className="stripe-form">
                    <PaymentElement options={{
                        layout: 'tabs',
                        business: { name: 'ZhenKala' }
                    }} />
                    <button
                        type="submit"
                        disabled={!stripe || loading}
                        className="place-order-btn mt-6 w-full"
                    >
                        {loading ? 'Processing...' : `Pay ${amount}`}
                    </button>
                </form>
            )}
        </div>
    );
};

export default StripePaymentForm;
