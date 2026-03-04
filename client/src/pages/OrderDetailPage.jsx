import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useCurrency, SUPPORTED_CURRENCIES } from '../context/CurrencyContext';
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin, FiCreditCard, FiPrinter, FiShield, FiCalendar } from 'react-icons/fi';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isSuccess = new URLSearchParams(location.search).get('success') === 'true';

  const [order, setOrder] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Define local formatter that respects order currency
  const formatOrderPrice = (amount) => {
    if (!order) return '';
    const symbol = SUPPORTED_CURRENCIES[order.currency]?.symbol || order.currency;
    return `${symbol}${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, merchantRes] = await Promise.all([
          api.get(`/orders/${id}`),
          api.get('/merchant-details')
        ]);
        setOrder(orderRes.data);
        setMerchant(merchantRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="order-detail-loading">Loading Order...</div>;
  if (error) return <div className="order-detail-error">{error}</div>;
  if (!order) return <div className="order-detail-error">Order Not Found</div>;

  return (
    <div className="order-receipt-container">
      {isSuccess && (
        <div className="success-banner">
          <FiCheckCircle className="success-icon" />
          <div className="success-text">
            <h1>Thank You!</h1>
            <p>Your order #{order._id.slice(-8).toUpperCase()} has been placed successfully.</p>
          </div>
        </div>
      )}

      {!order.isPaid && !isSuccess ? (
        <div className="payment-warning-banner failed-state">
          <div className="warning-content">
            <h3 className="text-red-600">❌ Payment Failed</h3>
            <p>Your transaction could not be completed at this time. To complete your order, please pick a different payment method.</p>
            <div className="warning-actions">
              <Link to={`/checkout?orderId=${order._id}`} className="retry-btn">Select New Payment Method</Link>
              <Link to="/contact" className="support-btn">Contact Support</Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={`invoice-box ${!order.isPaid ? 'unpaid-watermark' : ''}`} id="invoice">

            {/* LOGO TOP */}
            <header className="invoice-header-premium">
              <div className="invoice-logo-top">
                <img src="/LogoRed.svg" alt="ZhenKala" />
                <p className="tagline">Authentic Himalayan Art</p>
                <div className="merchant-sub-meta">
                  <span>{merchant?.contactEmail}</span>
                  <span className="dot">•</span>
                  <span>{merchant?.contactPhone}</span>
                </div>
              </div>
            </header>

            {/* INVOICE HEADER ROW */}
            <div className="invoice-header-row">
              {/* LEFT: SHIP TO */}
              <div className="ship-to-section">
                <h3>SHIP TO</h3>
                <div className="address-block">
                  <p className="recipient-name">{order.user?.firstName} {order.user?.lastName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="phone">Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>

              {/* RIGHT: INVOICE DETAILS */}
              <div className="invoice-details-section">
                <h1 className="invoice-title">{order.isPaid ? 'INVOICE' : 'PROFORMA INVOICE'}</h1>

                <div className="meta-grid">
                  <p><strong>Order ID:</strong> <span>{order._id.toUpperCase()}</span></p>
                  <p><strong>Date:</strong> <span>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span></p>
                  <p><strong>Status:</strong> <span className={`status-pill ${order.orderStatus.replace(/\s+/g, '-')}`}>{order.orderStatus.toUpperCase()}</span></p>
                  <p><strong>Currency:</strong> <span>{order.currency || 'USD'}</span></p>
                </div>

                {order.isPaid && (
                  <div className="payment-confirmation-meta">
                    <p><strong>Transaction ID:</strong> <span>{order.paymentResult?.id?.toUpperCase()}</span></p>
                    <p><strong>Paid On:</strong> <span>{new Date(order.paidAt).toLocaleDateString()} {new Date(order.paidAt).toLocaleTimeString()}</span></p>
                  </div>
                )}
              </div>
            </div>

            <div className="invoice-items">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-center">Price</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="item-info">
                          <strong>{item.name}</strong>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </td>
                      <td className="text-center">{formatOrderPrice(item.price)}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{formatOrderPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="invoice-footer-grid">
              <div className="totals-col">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{formatOrderPrice(order.itemsPrice)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{order.shippingPrice > 0 ? formatOrderPrice(order.shippingPrice) : 'FREE'}</span>
                </div>
                <div className="total-row grand-total">
                  <span>TOTAL PAID</span>
                  <span>{formatOrderPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons no-print">
            {order.isPaid && (
              <button onClick={handlePrint} className="print-btn">
                <FiPrinter /> Print Invoice
              </button>
            )}
            <Link to="/products" className="continue-btn">
              Continue Shopping
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetailPage;
