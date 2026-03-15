import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiGlobe, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import './Navbar.css';
import api from '../services/api';

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
  
  const mobileMenuRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const { currencies, selectedCurrency, changeCurrency } = useCurrency();
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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
    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
      googleSelect.value = lang.code;
      googleSelect.dispatchEvent(new Event('change'));
    }
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
                <Link to="/profile" className="navbar-action">
                  <FiUser /> <span className="action-text">{user?.firstName}</span>
                </Link>
              ) : (
                <Link to="/login" className="navbar-action">
                  <FiUser /> <span className="action-text">Account</span>
                </Link>
              )}
              
              <button className="lg:hidden navbar-mobile-toggle" onClick={() => setIsMenuOpen(true)}>
                <FiMenu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

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
    </>
  );
};

export default Navbar;