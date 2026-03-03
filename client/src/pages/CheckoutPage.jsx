import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../services/api';
import './CheckoutPage.css';

// Stripe & PayPal Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import StripePaymentForm from '../components/payment/StripePaymentForm';
import PayPalPayment from '../components/payment/PayPalPayment';
import { STRIPE_PUBLIC_KEY, PAYPAL_CLIENT_ID } from '../config/payment';

// stripePromise is now handled as state inside CheckoutPage component

const PaymentIcons = {
  'Apple Pay': 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg',
  'Google Pay': 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
  'MasterCard': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
  'Visa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg/640px-Visa_Inc._logo_%282021%E2%80%93present%29.svg.png',
  'PayPal': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
  'Union Pay': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg',
  'American Express': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
  'Alipay': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Alipay_logo.svg',
  'WeChat Pay': 'https://upload.wikimedia.org/wikipedia/commons/a/af/WeChat-Pay.svg'
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { formatPrice, selectedCurrency } = useCurrency();

  const subtotal = getCartTotal();
  const shippingPrice = subtotal > 0 && subtotal < 100 ? 15 : 0;
  const totalPrice = subtotal + shippingPrice;

  // States
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', country: '', zipCode: '', phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [config, setConfig] = useState({
    stripePublicKey: STRIPE_PUBLIC_KEY,
    paypalClientId: PAYPAL_CLIENT_ID
  });

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch profile
        const { data: profile } = await api.get('/users/profile');
        if (profile.address) {
          setShippingAddress(prev => ({
            ...prev,
            ...profile.address,
            phone: profile.address.phone || prev.phone || ''
          }));
        }

        // Fetch payment config
        const { data: paymentConfig } = await api.get('/payments/config');
        setConfig(paymentConfig);
      } catch (err) {
        console.error('Error fetching checkout data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cart.items.length, navigate]);

  // Dynamic Stripe Promise
  const [stripeInstance, setStripeInstance] = useState(null);
  useEffect(() => {
    if (config.stripePublicKey) {
      loadStripe(config.stripePublicKey).then(setStripeInstance);
    }
  }, [config.stripePublicKey]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  // Step 1: Confirm Shipping & Create Order Intent
  const goToPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        orderItems: cart.items.map(item => ({
          product: item.product?._id || item.product?.id || item.product,
          variant: item.variantId,
          name: item.product?.name || item.name,
          quantity: item.quantity,
          image: item.product?.images?.[0]?.url || item.image || '',
          price: item.price,
          size: item.size,
          color: item.color
        })),
        shippingAddress,
        paymentMethod: 'processing', // Temporary status
        itemsPrice: subtotal,
        shippingPrice,
        totalPrice,
        currency: selectedCurrency
      };

      const { data: order } = await api.post('/orders', orderData);
      setCreatedOrderId(order._id);

      // Fetch Stripe Client Secret
      const { data: paymentIntent } = await api.post('/payments/create-payment-intent', {
        amount: totalPrice,
        currency: selectedCurrency.toLowerCase(),
        metadata: { orderId: order._id }
      });

      setClientSecret(paymentIntent.clientSecret);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize payment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await clearCart();
    navigate(`/orders/${createdOrderId}?success=true`);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-layout">
        <div className="checkout-form-section">
          {step === 1 ? (
            <>
              <h2 className="section-title garamond">Shipping Details</h2>
              <form onSubmit={goToPayment}>
                <div className="form-group full-width">
                  <label>Street Address</label>
                  <input type="text" name="street" value={shippingAddress.street} onChange={handleInputChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group"><label>City</label><input type="text" name="city" value={shippingAddress.city} onChange={handleInputChange} required /></div>
                  <div className="form-group"><label>State</label><input type="text" name="state" value={shippingAddress.state} onChange={handleInputChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Country</label><input type="text" name="country" value={shippingAddress.country} onChange={handleInputChange} required /></div>
                  <div className="form-group"><label>Zip Code</label><input type="text" name="zipCode" value={shippingAddress.zipCode} onChange={handleInputChange} required /></div>
                </div>
                <div className="form-group full-width">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleInputChange} required />
                </div>
                <button type="submit" className="place-order-btn mt-4" disabled={loading}>
                  {loading ? 'Initializing...' : 'Continue to Payment'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="section-title garamond">Select Payment Method</h2>
              <div className="payment-options mb-8">
                {Object.keys(PaymentIcons).map((method) => (
                  <label key={method} className={`payment-card ${paymentMethod === method ? 'active' : ''}`}>
                    <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <div className="payment-info"><img src={PaymentIcons[method]} alt={method} className="method-logo" /></div>
                  </label>
                ))}
              </div>

              {paymentMethod === 'PayPal' && (
                <PayPalScriptProvider options={{ "client-id": config.paypalClientId || PAYPAL_CLIENT_ID }}>
                  <PayPalPayment
                    amount={totalPrice}
                    orderId={createdOrderId}
                    onSuccess={handlePaymentSuccess}
                    onError={setError}
                  />
                </PayPalScriptProvider>
              )}

              {(paymentMethod && paymentMethod !== 'PayPal') && stripeInstance && (
                <Elements stripe={stripeInstance} options={{ clientSecret }}>
                  <StripePaymentForm
                    amount={formatPrice(totalPrice)}
                    orderId={createdOrderId}
                    onSuccess={handlePaymentSuccess}
                    onError={setError}
                  />
                </Elements>
              )}

              <button onClick={() => setStep(1)} className="back-btn mt-4">Edit Shipping Details</button>
            </>
          )}
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="checkout-summary-section">
          <div className="sticky-summary">
            <h2 className="section-title garamond">Order Summary</h2>
            <div className="cart-items-preview">
              {cart.items.map((item, idx) => (
                <div key={idx} className="preview-item">
                  <div className="item-img"><img src={item.product?.images?.[0]?.url || '/placeholder.jpg'} alt={item.product?.name} /></div>
                  <div className="item-details"><p className="item-name">{item.product?.name || item.name}</p><p className="item-meta">Qty: {item.quantity}</p></div>
                  <div className="item-price">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="summary-calculations">
              <div className="calc-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="calc-row"><span>Shipping</span><span>{shippingPrice > 0 ? formatPrice(shippingPrice) : 'FREE'}</span></div>
              <div className="calc-row total"><span>Total</span><span>{formatPrice(totalPrice)}</span></div>
            </div>
            <p className="secure-text">Secure Checkout - SSL Encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
