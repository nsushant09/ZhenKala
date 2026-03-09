import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  'Alipay': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/dd/Alipay_logo_%282024%29.svg/960px-Alipay_logo_%282024%29.svg.png?_=20240609043243',
  'WeChat Pay': 'https://brandlogos.net/wp-content/uploads/2023/09/wechat_pay-logo_brandlogos.net_3mmfw-512x152.png'
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartTotal, clearCart } = useCart();
  const { formatPrice, selectedCurrency } = useCurrency();

  const [subtotal, setSubtotal] = useState(getCartTotal());
  const [shippingPrice, setShippingPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // States
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', country: '', zipCode: '', phone: ''
  });
  const [deliveryEstimate, setDeliveryEstimate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [intentDetails, setIntentDetails] = useState(null);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [isResumedOrder, setIsResumedOrder] = useState(false);
  const [config, setConfig] = useState({
    stripePublicKey: STRIPE_PUBLIC_KEY,
    paypalClientId: PAYPAL_CLIENT_ID
  });

  const calculateTotals = useCallback((baseSubtotal) => {
    const shipping = baseSubtotal > 0 && baseSubtotal < 100 ? 15 : 0;
    setSubtotal(baseSubtotal);
    setShippingPrice(shipping);
    setTotalPrice(baseSubtotal + shipping);
  }, []);

  useEffect(() => {
    // Check if country is Nepal or zip code is a 5-digit Nepali postcode
    // Nepali postcodes are 5 digits (e.g., 44600)
    const isNepal = shippingAddress.country?.trim().toLowerCase() === 'nepal' ||
      /^\d{5}$/.test(shippingAddress.zipCode?.trim());
    const days = isNepal ? 5 : 15;
    const date = new Date();
    date.setDate(date.getDate() + days);
    setDeliveryEstimate(date);
  }, [shippingAddress.country, shippingAddress.zipCode]);

  const handlePaymentRedirect = useCallback(async (params) => {
    const status = params.get('redirect_status');
    const piId = params.get('payment_intent');
    const orderId = params.get('orderId');

    if (!orderId || !piId) return;

    if (status === 'succeeded') {
      try {
        setLoading(true);
        await api.put(`/orders/${orderId}/pay`, {
          id: piId,
          status: 'succeeded',
          update_time: new Date().toISOString()
        });
        clearCart();
        navigate(`/orders/${orderId}?success=true`);
      } catch (err) {
        setError('Payment confirmed but we couldn\'t update your order status. Please contact support.');
      } finally {
        setLoading(false);
      }
    } else if (status === 'failed' || status === 'canceled') {
      await api.put(`/orders/${orderId}/fail`);
      setError('Payment failed or was cancelled. Please select a different method or try again.');
    }
  }, [navigate, clearCart]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resumeOrderId = queryParams.get('orderId');
    const fromRedirect = queryParams.get('from_redirect') === 'true';

    if (!resumeOrderId && cart.items.length === 0 && !fromRedirect) {
      navigate('/cart');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch payment config
        const { data: paymentConfig } = await api.get('/payments/config');
        setConfig(paymentConfig);

        if (resumeOrderId) {
          // Resume existing order
          const { data: order } = await api.get(`/orders/${resumeOrderId}`);
          if (order.isPaid) {
            navigate(`/orders/${resumeOrderId}`);
            return;
          }
          setCreatedOrderId(order._id);
          setShippingAddress(order.shippingAddress);
          calculateTotals(order.itemsPrice);
          setIsResumedOrder(true);
          setStep(2);

          // If coming back from a Stripe redirect
          if (fromRedirect) {
            handlePaymentRedirect(queryParams);
          }
        } else {
          // New order flow, fetch profile
          const { data: profile } = await api.get('/users/profile');
          if (profile.address) {
            setShippingAddress(prev => ({
              ...prev,
              ...profile.address,
              phone: profile.address.phone || prev.phone || ''
            }));
          }
          calculateTotals(getCartTotal());
        }
      } catch (err) {
        console.error('Error fetching checkout data:', err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cart.items.length, navigate, location.search, calculateTotals, getCartTotal]);

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

  // Step 1: Confirm Shipping & Create Order 
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
        paymentMethod: 'processing',
        itemsPrice: subtotal,
        shippingPrice,
        totalPrice,
        currency: selectedCurrency,
        estimatedDeliveryDate: deliveryEstimate
      };

      const { data: order } = await api.post('/orders', orderData);
      setCreatedOrderId(order._id);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Stripe Intent when method changes
  useEffect(() => {
    if (step !== 2 || !paymentMethod || paymentMethod === 'PayPal') {
      setClientSecret('');
      return;
    }

    const createIntent = async () => {
      setLoading(true);
      setError('');
      setClientSecret(''); // Reset while loading
      try {
        let amount = totalPrice;
        let currency = selectedCurrency.toLowerCase();

        // Specific handling for Alipay/WeChat Pay currency requirements
        if (paymentMethod === 'Alipay' || paymentMethod === 'WeChat Pay') {
          if (currency !== 'cny' && currency !== 'eur') {
            try {
              const res = await fetch(`https://raw.githubusercontent.com/WoXy-Sensei/currency-api/main/api/USD_CNY.json`);
              const data = await res.json();
              const rate = data.rate || 7.2;
              amount = totalPrice * rate;
              currency = 'cny';
            } catch (err) {
              amount = totalPrice * 7.2;
              currency = 'cny';
            }
          }
        }

        const { data: intentData } = await api.post('/payments/create-payment-intent', {
          amount: amount,
          currency: currency,
          paymentMethodType: paymentMethod,
          metadata: { orderId: createdOrderId }
        });

        setIntentDetails(intentData);
        setClientSecret(intentData.clientSecret);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize gateway.');
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [paymentMethod, step, createdOrderId, totalPrice, selectedCurrency]);

  const handlePaymentSuccess = async () => {
    await clearCart();
    navigate(`/orders/${createdOrderId}?success=true`);
  };

  const getDisplayAmount = () => {
    if (intentDetails && intentDetails.currency.toUpperCase() === 'CNY') {
      return `¥ ${(intentDetails.amount / 100).toFixed(2)}`;
    }
    return formatPrice(totalPrice);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-layout">
        <div className="checkout-form-section">
          {error && (
            <div className="bg-red-600/10 border border-red-600/50 text-red-600 p-4 rounded-lg mb-8 text-center font-medium animate-pulse">
              {error}
            </div>
          )}

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
              <div className="payment-categories space-y-6">
                {/* Cards Section */}
                <div className="payment-category">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Credit / Debit Cards</h4>
                  <div className="payment-options-grid">
                    {['Visa', 'MasterCard', 'American Express', 'Union Pay'].map((method) => (
                      <label key={method} className={`payment-card ${paymentMethod === method ? 'active' : ''}`}>
                        <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
                        <div className="payment-info">
                          <img src={PaymentIcons[method]} alt={method} className="method-logo h-6" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Wallets Section */}
                <div className="payment-category">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Digital Wallets</h4>
                  <div className="payment-options-grid">
                    {['PayPal'].map((method) => (
                      <label key={method} className={`payment-card ${paymentMethod === method ? 'active' : ''}`}>
                        <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
                        <div className="payment-info">
                          <img src={PaymentIcons[method]} alt={method} className="method-logo h-6" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Regional Section */}
                <div className="payment-category">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Regional Methods</h4>
                  <div className="payment-options-grid">
                    {['Alipay', 'WeChat Pay'].map((method) => (
                      <label key={method} className={`payment-card ${paymentMethod === method ? 'active' : ''}`}>
                        <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
                        <div className="payment-info">
                          <img src={PaymentIcons[method]} alt={method} className="method-logo h-6" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
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

              {(paymentMethod && paymentMethod !== 'PayPal') && stripeInstance && clientSecret && (
                <Elements stripe={stripeInstance} options={{ clientSecret }}>
                  <StripePaymentForm
                    amount={getDisplayAmount()}
                    orderId={createdOrderId}
                    selectedMethod={paymentMethod}
                    onSuccess={handlePaymentSuccess}
                    onError={setError}
                  />
                </Elements>
              )}

              {loading && !clientSecret && paymentMethod && paymentMethod !== 'PayPal' && (
                <div className="p-12 text-center text-gray-400">
                  Initializing secure connection for {paymentMethod}...
                </div>
              )}

              {!isResumedOrder && <button onClick={() => setStep(1)} className="back-btn mt-4">Edit Shipping Details</button>}
            </>
          )}
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
              <div className="calc-row delivery-estimate-row">
                <span>Estimated Delivery</span>
                <span>
                  {deliveryEstimate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
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