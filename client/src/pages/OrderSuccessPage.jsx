import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();

    const [status, setStatus] = useState('processing');
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        const confirmPayment = async () => {
            const queryParams = new URLSearchParams(location.search);
            const piId = queryParams.get('payment_intent');
            const stripeStatus = queryParams.get('redirect_status');
            const oid = queryParams.get('orderId');

            setOrderId(oid);

            if (!oid || !piId) {
                setStatus('error');
                setError('Invalid session or missing order information.');
                return;
            }

            if (stripeStatus === 'succeeded') {
                try {
                    await api.put(`/orders/${oid}/pay`, {
                        id: piId,
                        status: 'succeeded',
                        update_time: new Date().toISOString()
                    });

                    await clearCart();
                    setStatus('success');

                    // Smooth redirect to invoice
                    setTimeout(() => {
                        navigate(`/orders/${oid}?success=true`);
                    }, 2000);
                } catch (err) {
                    console.error('Finalization error:', err);
                    setStatus('error');
                    setError('Payment was successful, but we couldn\'t update your order. Please contact support.');
                }
            } else {
                await api.put(`/orders/${oid}/fail`);
                setStatus('error');
                setError('Payment process was not completed successfully.');
            }
        };

        confirmPayment();
    }, [location.search, navigate, clearCart]);

    return (
        <div className="order-success-page">
            <div className="success-content-card">
                {status === 'processing' && (
                    <div className="status-box">
                        <div className="premium-loader"></div>
                        <h2 className="garamond">Securely Confirming Your Order</h2>
                        <p>We're finalizing your payment details. Please do not refresh the page.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="status-box success">
                        <div className="check-ring">
                            <svg viewBox="0 0 52 52">
                                <circle className="check-ring__circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="check-ring__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>
                        <h2 className="garamond">Payment Successful!</h2>
                        <p>Redirecting you to your invoice...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="status-box error">
                        <div className="error-icon">❌</div>
                        <h2 className="garamond">Something Went Wrong</h2>
                        <p>{error}</p>
                        <div className="error-actions">
                            <Link to="/contact" className="support-link">Contact Support</Link>
                            <Link to="/" className="home-link">Return Home</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderSuccessPage;
