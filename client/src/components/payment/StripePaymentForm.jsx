import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import api from '../../services/api';

const StripePaymentForm = ({ amount, orderId, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL for redirection if needed
                return_url: `${window.location.origin}/orders/${orderId}?success=true`,
            },
            redirect: 'if_required',
        });

        if (error) {
            onError(error.message);
            setLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Mark order as paid on our backend
            try {
                await api.put(`/orders/${orderId}/pay`, {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    update_time: new Date().toISOString(),
                    email_address: paymentIntent.receipt_email || '',
                    paymentMethod: 'Card / Digital Wallet'
                });
                onSuccess();
            } catch (err) {
                onError('Payment succeeded but failed to update order status.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-form">
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || loading}
                className="place-order-btn mt-4"
            >
                {loading ? 'Processing...' : `Pay ${amount}`}
            </button>
        </form>
    );
};

export default StripePaymentForm;
