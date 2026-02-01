import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">

      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <Link to="/" className="navbar-logo">
              <img src="/LogoWhite.svg" alt="Zhen Kala" style={{ height: '36px', width: 'auto' }} />
            </Link>
            <p className="footer-description">
              We believe that art is the loudest way to speak. Our shop exists to give our artisans a global stage, turning their quiet dedication into a bold statement of talent. When you choose us, you aren't just buying a craft—you’re investing in a dream that has finally found its form.
            </p>
          </div>

          {/* Explore Links */}
          <div className="footer-section">
            <h3 className="footer-title">Explore</h3>
            <ul className="footer-links">
              <li><Link to="/products">Collection</Link></li>
              <li><Link to="/products?category=Silk Brocade">Silk Brocade</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/about#mission">Mission</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/delivery">Delivery Information</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/returns">Return/Refund Policy</Link></li>
              <li><Link to="/faq">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-section">
            <h3 className="footer-title">Contact</h3>
            <ul className="footer-contact">
              <li>+977 9851012345</li>
              <li>info@zhenkala.com</li>
              <li>Thamel-12, Kathmandu, Nepal</li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        {/* Bottom Footer */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 ZhenKala. All rights reserved.
          </p>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
              <FaPinterest />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
