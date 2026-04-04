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
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const { currencies, selectedCurrency, changeCurrency } = useCurrency();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Sync with Google Translate on mount
  useEffect(() => {
    const checkGoogleTranslate = () => {
      const cookieValue = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
      if (cookieValue) {
        try {
          const langCode = cookieValue.split('=')[1].split('/').pop();
          const matchedLang = languages.find(l => l.code === langCode);
          if (matchedLang) {
            setCurrentLang(matchedLang.name);
          }
        } catch (err) {
          console.error('Error parsing googtrans cookie:', err);
        }
      }
    };
    
    // Check after a short delay
    const timer = setTimeout(checkGoogleTranslate, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories?tree=true');
        setCategories(data);
      } catch (e) { console.error(e); }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setCurrentLang(lang.name);
    setIsLangOpen(false);

    const triggerGoogleTranslate = () => {
      const googleSelect = document.querySelector('.goog-te-combo');
      if (googleSelect) {
        googleSelect.value = lang.code;
        googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
        googleSelect.dispatchEvent(new Event('click', { bubbles: true }));
      } else {
        // Fallback retry
        setTimeout(() => {
          const retrySelect = document.querySelector('.goog-te-combo');
          if (retrySelect) {
            retrySelect.value = lang.code;
            retrySelect.dispatchEvent(new Event('change', { bubbles: true }));
            retrySelect.dispatchEvent(new Event('click', { bubbles: true }));
          }
        }, 500);
      }
    };

    triggerGoogleTranslate();
  };

  return (
    <>
      {/* Top Bar */}
      <div className="navbar-top">
        <div className="container">
          <div className="navbar-top-content">
            <div className="language-selector-advanced"
              onMouseEnter={() => setIsLangOpen(true)}
              onMouseLeave={() => setIsLangOpen(false)}>
              {/* HIDDEN GOOGLE ELEMENT */}
              <div id="google_translate_element" style={{ visibility: 'hidden', position: 'absolute', zIndex: -1, height: 0, width: 0, overflow: 'hidden' }}></div>
              <button className="lang-toggle-btn">
                <FiGlobe /> <span>{currentLang}</span>
                <FiChevronDown className={isLangOpen ? 'rotate' : ''} />
              </button>
              {isLangOpen && (
                <div className="lang-dropdown-advanced">
                  <div className="lang-grid">
                    {languages.map(lang => (
                      <button key={lang.code} onClick={() => handleLanguageChange(lang)} className="lang-option">
                        <span className="lang-native">{lang.native}</span>
                        <span className="lang-name-en">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="tagline">Where tradition meets transformation</div>

            <div className="currency-selector-advanced"
              onMouseEnter={() => setIsCurrencyOpen(true)}
              onMouseLeave={() => setIsCurrencyOpen(false)}>
              <button className="currency-toggle-btn">
                <span>{selectedCurrency.toUpperCase()}</span>
                <FiChevronDown className={isCurrencyOpen ? 'rotate' : ''} />
              </button>
              {isCurrencyOpen && (
                <div className="currency-dropdown-list">
                  {Object.entries(currencies).map(([code, info]) => (
                    <button key={code} onClick={() => { changeCurrency(code); setIsCurrencyOpen(false); }} className="currency-option">
                      {code.toUpperCase()} - {info.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <nav className="navbar-main">
        <div className="container">
          <div className="navbar-content">
            <Link to="/"><img src="/LogoRed.svg" alt="Logo" style={{ height: '32px' }} /></Link>

            {/* RESTORED: Desktop Links */}
            <div className="navbar-links hidden lg:flex">
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact Us</Link>
            </div>

            <form className="navbar-search hidden lg:flex" onSubmit={handleSearch}>
              <input type="text" placeholder="Search Product" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button type="submit"><FiSearch /></button>
            </form>

            <div className="navbar-actions">
              <Link to="/cart" className="navbar-action">
                <div className="cart-icon-wrapper">
                  <FiShoppingCart />
                  {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
                </div>
                <span className="action-text">Cart</span>
              </Link>

              {isAuthenticated ? (
                <div
                  className="navbar-user-menu"
                  ref={userMenuRef}
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <button type="button" className="navbar-action">
                    <FiUser />
                    <span>{user?.firstName}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="user-dropdown is-open">
                      <Link to="/profile" onClick={() => setIsUserMenuOpen(false)}>Profile</Link>
                      <Link to="/orders" onClick={() => setIsUserMenuOpen(false)}>My Orders</Link>
                      {user?.role === 'admin' && (
                        <>
                          <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}>Admin Dashboard</Link>
                          <Link to="/admin/settings" onClick={() => setIsUserMenuOpen(false)}>Merchant Settings</Link>
                        </>
                      )}
                      <button type="button" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="navbar-action">
                  <FiUser />
                  <span>Sign In</span>
                </Link>
              )}

              <button className="lg:hidden navbar-mobile-toggle" onClick={() => setIsMenuOpen(true)}>
                <FiMenu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Categories Bar with Mega Menu */}
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

      {/* Mobile Menu Sidebar */}
      {isMenuOpen && (
        <div className="navbar-mobile-menu">
          <div className="mobile-menu-content" ref={mobileMenuRef}>
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Menu</span>
              <button className="mobile-close-btn" onClick={() => setIsMenuOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <form className="mobile-search-form" onSubmit={handleSearch}>
              <div className="mobile-search-wrapper">
                <input
                  type="text"
                  placeholder="Search Product"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit"><FiSearch /></button>
              </div>
            </form>

            <div className="mobile-categories-section">
              <h3 className="mobile-section-label">Categories</h3>
              <div className="mobile-category-list">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat.name}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="mobile-category-link"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
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