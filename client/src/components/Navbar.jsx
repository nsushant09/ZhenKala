import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiGlobe, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import './Navbar.css';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '中文 (简体)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '中文 (繁體)' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');
  const closeTimeoutRef = useRef(null);

  const handleLangEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsLangOpen(true);
  };

  const handleLangLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsLangOpen(false);
    }, 200); // 200ms delay for smooth UX
  };

  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const { currencies, selectedCurrency, changeCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(null);

  // Close mega menu on route change
  useEffect(() => {
    setActiveCategory(null);
    setIsMenuOpen(false); // Also close mobile menu
  }, [location.pathname]);

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

    // Google Translate Initialization
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    const addGoogleTranslateScript = () => {
      if (document.querySelector('script[src*="translate.google.com"]')) return;
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    addGoogleTranslateScript();
  }, []);

  const handleLanguageChange = (lang) => {
    setCurrentLang(lang.name);
    setIsLangOpen(false);

    // Robust Communication with Google Translate
    const triggerTranslation = () => {
      const googleSelect = document.querySelector('.goog-te-combo');
      if (googleSelect) {
        googleSelect.value = lang.code;
        googleSelect.dispatchEvent(new Event('change'));
      } else {
        // Retry a few times in case Google hasn't finished rendering the element
        setTimeout(triggerTranslation, 200);
      }
    };
    triggerTranslation();
  };

  return (
    <>
      {/* Top Bar */}
      <div className="navbar-top">
        <div className="px-16 px-md-4">
          <div className="navbar-top-content">
            <div
              className="language-selector-advanced"
              onMouseEnter={handleLangEnter}
              onMouseLeave={handleLangLeave}
            >
              <button className="lang-toggle-btn">
                <FiGlobe className="globe-icon" />
                <span className="current-lang-text">{currentLang}</span>
                <FiChevronDown className={`chevron-icon ${isLangOpen ? 'rotate' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="lang-dropdown-advanced">
                  <div className="lang-grid">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        className={`lang-option ${currentLang === lang.name ? 'active' : ''}`}
                      >
                        <span className="lang-native">{lang.native}</span>
                        <span className="lang-name-en">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actual Google element is hidden but functional */}
              <div id="google_translate_element" style={{ visibility: 'hidden', position: 'absolute', zIndex: -1 }}></div>
            </div>

            <div className="tagline">Where tradition meets transformation</div>
            <div className="currency-selector">
              <select value={selectedCurrency} onChange={(e) => changeCurrency(e.target.value)}>
                {Object.entries(currencies).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.name} ({code.toUpperCase()})
                  </option>
                ))}
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
                      <>
                        <Link to="/admin">Admin Dashboard</Link>
                        <Link to="/admin/settings">Merchant Settings</Link>
                      </>
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
            <div
              key={category._id}
              className="category-item"
              onMouseEnter={() => setActiveCategory(category._id)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <Link
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="category-link"
                onClick={() => setActiveCategory(null)}
              >
                {category.name}
                {category.children && category.children.length > 0 && <span className="dropdown-arrow">▾</span>}
              </Link>
              {category.children && category.children.length > 0 && activeCategory === category._id && (
                <div className="mega-menu" style={{ display: 'block', opacity: 1, visibility: 'visible' }}>
                  <div className="container">
                    <div className="mega-menu-grid">
                      {category.children.map((child) => (
                        <div key={child._id} className="mega-menu-column">
                          <Link
                            to={`/products?category=${encodeURIComponent(child.name)}`}
                            className="mega-menu-title"
                            onClick={() => setActiveCategory(null)}
                          >
                            {child.name}
                          </Link>
                          {child.children && child.children.length > 0 && (
                            <ul className="mega-menu-list">
                              {child.children.map((subChild) => (
                                <li key={subChild._id}>
                                  <Link
                                    to={`/products?category=${encodeURIComponent(subChild.name)}`}
                                    onClick={() => setActiveCategory(null)}
                                  >
                                    {subChild.name}
                                  </Link>
                                  {subChild.children && subChild.children.length > 0 && (
                                    <ul className="mega-menu-sublist">
                                      {subChild.children.map((leaf) => (
                                        <li key={leaf._id}>
                                          <Link
                                            to={`/products?category=${encodeURIComponent(leaf.name)}`}
                                            onClick={() => setActiveCategory(null)}
                                          >
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
