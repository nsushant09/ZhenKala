import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin, FiCreditCard, FiPrinter } from 'react-icons/fi';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isSuccess = new URLSearchParams(location.search).get('success') === 'true';
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      <div className="invoice-box" id="invoice">
        <header className="invoice-header">
          <div className="invoice-logo">
            <img src="/LogoRed.svg" alt="ZhenKala" />
            <p className="tagline">Authentic Himalayan Art</p>
          </div>
          <div className="invoice-meta">
            <h1>INVOICE</h1>
            <p><strong>Order ID:</strong> {order._id.toUpperCase()}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            <p><strong>Status:</strong> <span className={`status-pill ${order.orderStatus}`}>{order.orderStatus.toUpperCase()}</span></p>
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
            <p><strong>{order.user?.name || 'Customer'}</strong></p>
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
                  <td className="text-center">{formatPrice(item.price)}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{formatPrice(item.price * item.quantity)}</td>
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
              <p className="payment-status paid">PAID on {new Date(order.paidAt).toLocaleDateString()}</p>
            ) : (
              <p className="payment-status unpaid">PAYMENT PENDING</p>
            )}

            {/* Merchant Bank Details Section requested by user */}
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
              <span>{formatPrice(order.itemsPrice)}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>{order.shippingPrice > 0 ? formatPrice(order.shippingPrice) : 'FREE'}</span>
            </div>
            <div className="total-row grand-total">
              <span>TOTAL</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons no-print">
        <button onClick={handlePrint} className="print-btn">
          <FiPrinter /> Print Invoice
        </button>
        <Link to="/products" className="continue-btn">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailPage;
