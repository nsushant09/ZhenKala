import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { FiPackage, FiChevronRight, FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="orders-loading">Loading your orders...</div>;

  return (
    <div className="orders-container">
      <header className="orders-header">
        <h1 className="garamond">My Orders</h1>
        <p>Track your purchases and view invoices.</p>
      </header>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <FiPackage className="empty-icon" />
          <h2>No orders yet</h2>
          <p>When you buy something, it will appear here.</p>
          <Link to="/products" className="shop-now-btn">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div className="order-main-info">
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="order-token">#{order._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className={`order-status-badge ${order.orderStatus}`}>
                  {order.orderStatus === 'pending' && <FiClock />}
                  {order.orderStatus === 'processing' && <FiPackage />}
                  {order.orderStatus === 'shipped' && <FiTruck />}
                  {order.orderStatus === 'delivered' && <FiCheckCircle />}
                  {order.orderStatus.toUpperCase()}
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-items-summary">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="summary-item-thumb">
                      <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                      {item.quantity > 1 && <span className="item-qty-badge">{item.quantity}</span>}
                    </div>
                  ))}
                </div>
                <div className="order-price-info">
                  <span className="price-label">Total Amount</span>
                  <span className="price-value">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>

              <div className="order-card-footer">
                <Link to={`/orders/${order._id}`} className="view-order-btn">
                  View Details & Invoice <FiChevronRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
