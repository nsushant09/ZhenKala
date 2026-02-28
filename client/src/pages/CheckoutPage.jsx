import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../services/api';
import './CheckoutPage.css';

// Official SVG Logos from Wikimedia
const PaymentIcons = {
  'Apple Pay': 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg',
  'Google Pay': 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
  'MasterCard': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
  'Visa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg/640px-Visa_Inc._logo_%282021%E2%80%93present%29.svg.png',
  'PayPal': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
  'Union Pay': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg',
  'American Express': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg'
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { formatPrice, selectedCurrency } = useCurrency();

  const subtotal = getCartTotal();
  const shippingPrice = subtotal > 0 && subtotal < 100 ? 15 : 0;
  const totalPrice = subtotal + shippingPrice;

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [saveAddress, setSaveAddress] = useState(false);

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        if (data.address) {
          setShippingAddress({
            street: data.address.street || '',
            city: data.address.city || '',
            state: data.address.state || '',
            country: data.address.country || '',
            zipCode: data.address.zipCode || '',
            phone: data.address.phone || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, [cart.items.length, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        orderItems: cart.items.map(item => ({
          product: item.product?._id || item.product?.id || item.product,
          name: item.product?.name || item.name,
          quantity: item.quantity,
          image: item.product?.images?.[0]?.url || item.image || '',
          price: item.price
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shippingPrice,
        totalPrice: totalPrice,
        currency: selectedCurrency // Track currency used
      };

      const { data } = await api.post('/orders', orderData);

      // If user checked "Save address", update user profile concurrently
      if (saveAddress) {
        api.put('/users/profile', { address: shippingAddress }).catch(e => console.error('Failed to save address:', e));
      }

      // If it's a simulated payment, we "pay" it immediately for now
      // In real app, we would redirect to Stripe/PayPal here
      await api.put(`/orders/${data._id}/pay`, {
        id: 'SIMULATED_PAYMENT_' + Date.now(),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: 'simulated@example.com'
      });

      await clearCart();
      navigate(`/orders/${data._id}?success=true`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-layout">
        {/* Left Column: Form */}
        <div className="checkout-form-section">
          <h2 className="section-title garamond">Shipping Details</h2>
          <form id="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group full-width">
              <label>Street Address</label>
              <input
                type="text"
                name="street"
                value={shippingAddress.street}
                onChange={handleInputChange}
                required
                placeholder="123 Himalayan St"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State / Province</label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Zip / Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={shippingAddress.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group full-width checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                />
                Save this address for future orders
              </label>
            </div>

            <h2 className="section-title garamond mt-12">Payment Method</h2>
            <div className="payment-options">
              {Object.keys(PaymentIcons).map((method) => (
                <label key={method} className={`payment-card ${paymentMethod === method ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <img src={PaymentIcons[method]} alt={method} className="method-logo" />
                  </div>
                </label>
              ))}
            </div>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>

        {/* Right Column: Summary */}
        <div className="checkout-summary-section">
          <div className="sticky-summary">
            <h2 className="section-title garamond">Order Summary</h2>
            <div className="cart-items-preview">
              {cart.items.map((item, idx) => (
                <div key={idx} className="preview-item">
                  <div className="item-img">
                    <img src={item.product?.images?.[0]?.url || '/placeholder.jpg'} alt={item.product?.name} />
                  </div>
                  <div className="item-details">
                    <p className="item-name">{item.product?.name || item.name}</p>
                    <p className="item-meta">Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-calculations">
              <div className="calc-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="calc-row">
                <span>Shipping</span>
                <span>{shippingPrice > 0 ? formatPrice(shippingPrice) : 'FREE'}</span>
              </div>
              <div className="calc-row total">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="place-order-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Place Order ${formatPrice(totalPrice)}`}
            </button>
            <p className="secure-text">Secure Checkout - SSL Encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
