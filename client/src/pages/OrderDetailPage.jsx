import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useCurrency, CURRENCY_SYMBOLS } from '../context/CurrencyContext';
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin, FiCreditCard, FiPrinter, FiShield, FiCalendar } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
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

    // Look up symbol from context mapping
    const symbol = CURRENCY_SYMBOLS[order.currency] || order.currency;

    return `${symbol} ${Number(amount).toLocaleString(undefined, {
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

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  );
  if (error) return <div className="order-detail-error">{error}</div>;
  if (!order) return <div className="order-detail-error">Order Not Found</div>;

  // Localization mapping
  const useChinese = order.currency === 'CNY';
  const t = {
    shipTo: useChinese ? '邮寄至' : 'SHIP TO',
    invoice: useChinese ? '发票' : 'INVOICE',
    proforma: useChinese ? '形式发票' : 'PROFORMA INVOICE',
    orderId: useChinese ? '订单编号' : 'Order ID',
    date: useChinese ? '日期' : 'Date',
    status: useChinese ? '状态' : 'Status',
    currency: useChinese ? '币种' : 'Currency',
    estDelivery: useChinese ? '预计送达' : 'Est. Delivery',
    trxId: useChinese ? '交易单号' : 'Transaction ID',
    paidOn: useChinese ? '付款时间' : 'Paid On',
    description: useChinese ? '项描述' : 'Description',
    price: useChinese ? '单价' : 'Price',
    qty: useChinese ? '数量' : 'Qty',
    total: useChinese ? '小计' : 'Total',
    subtotal: useChinese ? '商品小计' : 'Subtotal',
    shipping: useChinese ? '运费' : 'Shipping',
    totalPaid: useChinese ? '实付总额' : 'TOTAL PAID',
    free: useChinese ? '免费' : 'FREE',
    phone: useChinese ? '电话' : 'Phone',
    tagline: useChinese ? '地道的喜马拉雅艺术' : 'Authentic Himalayan Art',
    size: useChinese ? '尺寸' : 'Size',
    color: useChinese ? '颜色' : '颜色',
    print: useChinese ? '打印发票' : 'Print Invoice',
    continue: useChinese ? '继续购物' : 'Continue Shopping'
  };

  return (
    <div className="order-receipt-container">
      {isSuccess && (
        <div className="success-banner">
          <FiCheckCircle className="success-icon" />
          <div className="success-text">
            <h1>{useChinese ? '感谢您的购买！' : 'Thank You!'}</h1>
            <p>{useChinese ? `您的订单 #${order._id.slice(-8).toUpperCase()} 已成功下单。` : `Your order #${order._id.slice(-8).toUpperCase()} has been placed successfully.`}</p>
          </div>
        </div>
      )}

      {!order.isPaid && !isSuccess ? (
        <div className="payment-warning-banner failed-state">
          <div className="warning-content">
            <h3 className="text-red-600">❌ {useChinese ? '付款失败' : 'Payment Failed'}</h3>
            <p>{useChinese ? '您的交易目前无法完成。请选择其他付款方式以完成订单。' : 'Your transaction could not be completed at this time. To complete your order, please pick a different payment method.'}</p>
            <div className="warning-actions">
              <Link to={`/checkout?orderId=${order._id}`} className="retry-btn">{useChinese ? '选择新付款方式' : 'Select New Payment Method'}</Link>
              <Link to="/contact" className="support-btn">{useChinese ? '联系客服' : 'Contact Support'}</Link>
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
                <p className="tagline">{t.tagline}</p>
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
                <h3>{t.shipTo}</h3>
                <div className="address-block">
                  <p className="recipient-name">{order.user?.firstName} {order.user?.lastName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="phone">{t.phone}: {order.shippingAddress.phone}</p>
                </div>
              </div>

              {/* RIGHT: INVOICE DETAILS */}
              <div className="invoice-details-section">
                <h1 className="invoice-title">{order.isPaid ? t.invoice : t.proforma}</h1>

                <div className="meta-grid">
                  <p><strong>{t.orderId}:</strong> <span>{order._id.toUpperCase()}</span></p>
                  <p><strong>{t.date}:</strong> <span>{new Date(order.createdAt).toLocaleDateString(useChinese ? 'zh-CN' : undefined, { dateStyle: 'long' })}</span></p>
                  <p><strong>{t.status}:</strong> <span className={`status-pill ${order.orderStatus.replace(/\s+/g, '-')}`}>{order.orderStatus.toUpperCase()}</span></p>
                  <p><strong>{t.currency}:</strong> <span>{order.currency || 'USD'}</span></p>
                  {order.estimatedDeliveryDate && (
                    <p><strong>{t.estDelivery}:</strong> <span>{new Date(order.estimatedDeliveryDate).toLocaleDateString(useChinese ? 'zh-CN' : undefined, { dateStyle: 'long' })}</span></p>
                  )}
                </div>

                {order.isPaid && (
                  <div className="payment-confirmation-meta">
                    <p><strong>{t.trxId}:</strong> <span>{order.paymentResult?.id?.toUpperCase()}</span></p>
                    <p><strong>{t.paidOn}:</strong> <span>{new Date(order.paidAt).toLocaleDateString(useChinese ? 'zh-CN' : undefined)} {new Date(order.paidAt).toLocaleTimeString(useChinese ? 'zh-CN' : undefined)}</span></p>
                  </div>
                )}
              </div>
            </div>

            <div className="invoice-items">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>{t.description}</th>
                    <th className="text-center">{t.price}</th>
                    <th className="text-center">{t.qty}</th>
                    <th className="text-right">{t.total}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="item-info">
                          <strong>{item.name}</strong>
                          {item.size && <span>{t.size}: {item.size}</span>}
                          {item.color && <span>{t.color}: {item.color}</span>}
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
                  <span>{t.subtotal}</span>
                  <span>{formatOrderPrice(order.itemsPrice)}</span>
                </div>
                <div className="total-row">
                  <span>{t.shipping}</span>
                  <span>{order.shippingPrice > 0 ? formatOrderPrice(order.shippingPrice) : t.free}</span>
                </div>
                <div className="total-row grand-total">
                  <span>{t.totalPaid}</span>
                  <span>{formatOrderPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons no-print">
            {order.isPaid && (
              <button onClick={handlePrint} className="print-btn">
                <FiPrinter /> {t.print}
              </button>
            )}
            <Link to="/products" className="continue-btn">
              {t.continue}
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetailPage;
