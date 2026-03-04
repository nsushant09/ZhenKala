import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import api from '../../services/api';

const PayPalPayment = ({ amount, orderId, onSuccess, onError }) => {
    return (
        <div className="paypal-container">
            <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={(data, actions) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: amount.toString(),
                                },
                                reference_id: orderId,
                            },
                        ],
                    });
                }}
                onApprove={async (data, actions) => {
                    const details = await actions.order.capture();
                    try {
                        await api.put(`/orders/${orderId}/pay`, {
                            id: details.id,
                            status: details.status,
                            update_time: details.update_time,
                            email_address: details.payer.email_address,
                            paymentMethod: 'PayPal'
                        });
                        onSuccess();
                    } catch (err) {
                        onError('Payment captured but failed to update order.');
                    }
                }}
                onError={async (err) => {
                    await api.put(`/orders/${orderId}/fail`);
                    onError('PayPal Payment Error: ' + err.toString());
                }}
            />
        </div>
    );
};

export default PayPalPayment;
