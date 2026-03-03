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
        <div className="success-banner no-print">
          <FiCheckCircle className="success-icon" />
          <div className="success-text">
            <h1>Thank You!</h1>
            <p>Your order #{order._id.slice(-8).toUpperCase()} has been placed successfully.</p>
          </div>
        </div>
      )}

      {!order.isPaid && !isSuccess ? (
        <div className="payment-warning-banner no-print failed-state">
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
            {order.isPaid && (
              <div className="payment-confirmed-info-box">
                <div className="confirmed-icon">
                  <FiShield />
                </div>
                <div className="confirmed-details">
                  <h4>Payment Confirmed</h4>
                  <p>Transaction ID: {order.paymentResult?.id?.toUpperCase()}</p>
                  <p>Verified on {new Date(order.paidAt).toLocaleDateString()} {new Date(order.paidAt).toLocaleTimeString()}</p>
                </div>
              </div>
            )}

            <header className="invoice-header">
              <div className="invoice-logo">
                <img src="/LogoRed.svg" alt="ZhenKala" />
                <p className="tagline">Authentic Himalayan Art</p>
              </div>
              <div className="invoice-meta">
                <h1>{order.isPaid ? 'INVOICE' : 'PROFORMA INVOICE'}</h1>
                <p><strong>Order ID:</strong> {order._id.toUpperCase()}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                <p><strong>Status:</strong> <span className={`status-pill ${order.orderStatus}`}>{order.orderStatus.toUpperCase()}</span></p>
                <p><strong>Currency:</strong> {order.currency || 'USD'}</p>
              </div>
            </header>

            <div className="invoice-billing-grid">
              <div className="billing-col">
                <h3>FROM</h3>
                <p className="business-name">{merchant?.businessName || 'ZhenKala'}</p>
                <p className="business-address">{merchant?.address}</p>
                <p>{merchant?.contactEmail}</p>
                <p>{merchant?.contactPhone}</p>
                {merchant?.taxId && <p><strong>Tax ID:</strong> {merchant.taxId}</p>}
              </div>
              <div className="billing-col">
                <h3>SHIP TO</h3>
                <p><strong>{order.user?.firstName} {order.user?.lastName}</strong></p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
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
              <div className="payment-info-col">
                <h3>PAYMENT INFO</h3>
                <div className="payment-method-badge">
                  <FiCreditCard /> {order.paymentMethod}
                </div>
                {order.isPaid ? (
                  <p className="payment-status paid">PAID via {order.paymentMethod}</p>
                ) : (
                  <div className="payment-status unpaid-container">
                    <p className="unpaid-text">PAYMENT PENDING</p>
                    <p className="unpaid-subtext">This is not a final invoice until payment is received.</p>
                  </div>
                )}

                {merchant?.bankDetails?.accountNumber && (
                  <div className="bank-details-box">
                    <h4>Bank Transfer Details</h4>
                    <p><strong>Bank:</strong> {merchant.bankDetails.bankName}</p>
                    <p><strong>Account:</strong> {merchant.bankDetails.accountNumber}</p>
                    <p><strong>Name:</strong> {merchant.bankDetails.accountName}</p>
                    {merchant.bankDetails.swiftCode && <p><strong>SWIFT:</strong> {merchant.bankDetails.swiftCode}</p>}
                  </div>
                )}
              </div>
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
