import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { FiPackage, FiChevronRight, FiClock, FiCheckCircle, FiTruck, FiUser, FiMapPin } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProfilePage.css';
import './OrdersPage.css'; // For reusing order card styles

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [orders, setOrders] = useState([]);
  
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile and orders concurrently
        const [profileRes, ordersRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/orders/myorders')
        ]);
        
        const profileData = profileRes.data;
        
        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          phone: profileData.address?.phone || '',
          street: profileData.address?.street || '',
          city: profileData.address?.city || '',
          state: profileData.address?.state || '',
          country: profileData.address?.country || '',
          zipCode: profileData.address?.zipCode || ''
        });

        // Take only the 3 most recent orders
        setOrders(ordersRes.data.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        setUpdating(false);
        return;
      }
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
        setUpdating(false);
        return;
      }
    }

    try {
      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: {
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode
        }
      };

      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const { data } = await api.put('/users/profile', updatePayload);
      
      // Update the AuthContext so navbar reflects the change if firstName changed
      updateUser(data);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear password fields on success
      setFormData({ ...formData, password: '', confirmPassword: '' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1 className="garamond">My Profile</h1>
        <p>Manage your account settings and view recent activity.</p>
      </header>

      <div className="profile-content">
        
        {/* Profile Details Section */}
        <div className="profile-details-section">
          <h2 className="profile-section-title garamond">
            <FiUser style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> 
            Personal Information
          </h2>
          
          {message.text && (
            <div className={`profile-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="profile-grid-2">
              <div className="profile-form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="profile-form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="profile-form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
              />
            </div>

            <h2 className="profile-section-title garamond" style={{ marginTop: '2rem' }}>
              <FiMapPin style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> 
              Shipping Address
            </h2>

            <div className="profile-form-group">
              <label>Street Address</label>
              <input 
                type="text" 
                name="street" 
                value={formData.street} 
                onChange={handleChange} 
              />
            </div>

            <div className="profile-grid-2">
              <div className="profile-form-group">
                <label>City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                />
              </div>
              <div className="profile-form-group">
                <label>State / Province</label>
                <input 
                  type="text" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange} 
                />
              </div>
              <div className="profile-form-group">
                <label>Country</label>
                <input 
                  type="text" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange} 
                />
              </div>
              <div className="profile-form-group">
                <label>ZIP / Postal Code</label>
                <input 
                  type="text" 
                  name="zipCode" 
                  value={formData.zipCode} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <h2 className="profile-section-title garamond" style={{ marginTop: '2rem' }}>
              <FiUser style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> 
              Change Password
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
              Leave blank if you do not wish to change your password.
            </p>

            <div className="profile-grid-2">
              <div className="profile-form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div className="profile-form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button type="submit" className="profile-save-btn" disabled={updating}>
              {updating ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Recent Orders Section */}
        <div className="profile-orders-section">
          <h2 className="profile-section-title garamond">
            <FiPackage style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> 
            Recent Orders
          </h2>
          
          {orders.length === 0 ? (
            <div className="empty-orders" style={{ padding: '2rem 1rem' }}>
              <FiPackage className="empty-icon" style={{ fontSize: '2.5rem' }} />
              <h3 style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>No orders found</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>You haven't made any purchases yet.</p>
              <Link to="/products" className="shop-now-btn" style={{ padding: '0.75rem 1.5rem', marginTop: '1rem' }}>Shop Now</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-main-info">
                      <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="order-token" style={{ fontSize: '0.9rem' }}>#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className={`order-status-badge ${order.orderStatus}`}>
                      {order.orderStatus === 'pending' && <FiClock />}
                      {order.orderStatus === 'processing' && <FiPackage />}
                      {order.orderStatus === 'shipped' && <FiTruck />}
                      {order.orderStatus === 'delivered' && <FiCheckCircle />}
                      {/* Hide text on very small screens, just icon is enough */}
                      <span className="hidden sm:inline">{order.orderStatus.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-items-summary">
                      {order.orderItems.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="summary-item-thumb">
                          <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                          {item.quantity > 1 && <span className="item-qty-badge">{item.quantity}</span>}
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="summary-item-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#666', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          +{order.orderItems.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="order-price-info">
                      <span className="price-value" style={{ fontSize: '1.2rem' }}>{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <Link to={`/orders/${order._id}`} className="view-order-btn" style={{ fontSize: '0.8rem' }}>
                      View Details <FiChevronRight />
                    </Link>
                  </div>
                </div>
              ))}
              
              <Link to="/orders" className="profile-view-all-orders">
                View All Order History →
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
