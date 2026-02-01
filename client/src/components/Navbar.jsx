import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';
import ConfirmModal from './ConfirmModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const categories = [
    'Thangka Art',
    'Singing Bowl',
    'Statues',
    'Jewellery',
    'Oil Painting',
    'Prayer Flags',
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="navbar-top">
        <div className="px-16">
          <div className="navbar-top-content">
            <div className="language-selector">
              <select>
                <option>English</option>
                <option>Nepali</option>
                <option>中文</option>
              </select>
            </div>
            <div className="tagline">Where tradition meets transformation</div>
            <div className="currency-selector">
              <select>
                <option>Australian Dollar (AUD)</option>
                <option>US Dollar (USD)</option>
                <option>Euro (EUR)</option>
                <option>Nepali Rupee (NPR)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar-main">
        <div className="container">
          <div className="navbar-content">
            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <img src="/LogoRed.svg" alt="Zhen Kala" style={{ height: '36px', width: 'auto' }} />
            </Link>

            {/* Desktop Navigation */}
            <div className="navbar-links">
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact Us</Link>
            </div>

            {/* Search Bar */}
            <form className="navbar-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search Product"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <FiSearch />
              </button>
            </form>

            {/* Actions */}
            <div className="navbar-actions">
              <Link to="/cart" className="navbar-action">
                <FiShoppingCart />
                <span>Cart</span>
                {getCartCount() > 0 && (
                  <span className="cart-badge">{getCartCount()}</span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="navbar-user-menu">
                  <button className="navbar-action">
                    <FiUser />
                    <span>{user?.firstName}</span>
                  </button>
                  <div className="user-dropdown">
                    <Link to="/profile">Profile</Link>
                    <Link to="/orders">My Orders</Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin">Admin Dashboard</Link>
                    )}
                    <button onClick={confirmLogout}>Logout</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="navbar-action">
                  <FiUser />
                  <span>Account</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="navbar-mobile-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Category Navigation */}
      <div className="navbar-categories">
        <div className="container">
          <div className="categories-list">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="category-link"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="navbar-mobile-menu">
          <div className="mobile-menu-content">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {category}
              </Link>
            ))}
            <hr />
            <Link to="/about" onClick={() => setIsMenuOpen(false)}>
              About Us
            </Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
              Contact Us
            </Link>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your ZhenKala account?"
        confirmText="Logout"
        cancelText="Stay Logged In"
      />
    </>
  );
};

export default Navbar;
