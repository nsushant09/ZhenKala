import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';
import api from '../services/api';
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

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories?tree=true');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

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
          {categories.map((category) => (
            <div key={category._id} className="category-item">
              <Link
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="category-link"
              >
                {category.name}
                {category.children && category.children.length > 0 && <span className="dropdown-arrow">▾</span>}
              </Link>
              {category.children && category.children.length > 0 && (
                <div className="mega-menu">
                  <div className="container">
                    <div className="mega-menu-grid">
                      {category.children.map((child) => (
                        <div key={child._id} className="mega-menu-column">
                          <Link
                            to={`/products?category=${encodeURIComponent(child.name)}`}
                            className="mega-menu-title"
                          >
                            {child.name}
                          </Link>
                          {child.children && child.children.length > 0 && (
                            <ul className="mega-menu-list">
                              {child.children.map((subChild) => (
                                <li key={subChild._id}>
                                  <Link to={`/products?category=${encodeURIComponent(subChild.name)}`}>
                                    {subChild.name}
                                  </Link>
                                  {/* Level 4 handled by simple nested list if needed, or just flattened here */}
                                  {subChild.children && subChild.children.length > 0 && (
                                    <ul className="mega-menu-sublist">
                                      {subChild.children.map((leaf) => (
                                        <li key={leaf._id}>
                                          <Link to={`/products?category=${encodeURIComponent(leaf.name)}`}>
                                            {leaf.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="navbar-mobile-menu">
          <div className="mobile-menu-content">
            {categories.map((category) => (
              <div key={category._id} className="mobile-category-item">
                <div className="mobile-category-header">
                  <Link
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  {category.children && category.children.length > 0 && (
                    <button className="mobile-submenu-toggle">▾</button>
                  )}
                </div>
                {/* Mobile nested menu can be further refined with state but for now just list top levels */}
              </div>
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
