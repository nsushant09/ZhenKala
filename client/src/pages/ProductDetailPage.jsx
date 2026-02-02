import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaPinterest, FaWhatsapp } from 'react-icons/fa';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showStickyCart, setShowStickyCart] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchSimilarProducts();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      // Set default variant if variants exist
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const { data } = await api.get(`/products/${id}/similar`);
      setSimilarProducts(data);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    setShowStickyCart(scrollPosition > 600);
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      product: product._id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      image: product.images[0]?.url,
      quantity,
      variant: selectedVariant ? {
        size: selectedVariant.size,
        color: selectedVariant.color,
      } : null,
    };

    addToCart(cartItem);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment('');
      setReviewRating(5);
      fetchProduct(); // Refresh to show new review
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  const shareProduct = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product.name}`;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const getAvailableStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock;
    }
    return product?.stock || 0;
  };

  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.discount > 0
        ? selectedVariant.price * (1 - selectedVariant.discount / 100)
        : selectedVariant.price;
    }
    return product?.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product?.price || 0;
  };

  const getOriginalPrice = () => {
    if (selectedVariant) {
      return selectedVariant.originalPrice || selectedVariant.price;
    }
    return product?.originalPrice || product?.price || 0;
  };

  const hasDiscount = () => {
    if (selectedVariant) {
      return selectedVariant.discount > 0;
    }
    return product?.discount > 0;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/products" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category?.name}`}>{product.category?.name}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container product-main-section">
        <div className="product-grid">
          {/* Image Gallery */}
          <div className="product-images">
            <div className="main-image">
              <img src={product.images[selectedImage]?.url} alt={product.images[selectedImage]?.alt || product.name} />
            </div>
            {product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image.url} alt={image.alt || `${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1>{product.name}</h1>

            {/* Rating */}
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={i < Math.round(product.rating) ? 'filled' : ''} />
                ))}
              </div>
              <span className="rating-text">
                {product.rating.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="product-price">
              <span className="current-price">${getCurrentPrice().toFixed(2)}</span>
              {hasDiscount() && (
                <>
                  <span className="original-price">${getOriginalPrice().toFixed(2)}</span>
                  <span className="discount-badge">
                    {selectedVariant ? selectedVariant.discount : product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="product-description" dangerouslySetInnerHTML={{ __html: product.description }} />

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="variant-selection">
                {/* Size Selection */}
                {product.variants.some(v => v.size) && (
                  <div className="variant-group">
                    <label>Size:</label>
                    <div className="variant-options">
                      {[...new Set(product.variants.filter(v => v.size).map(v => v.size))].map((size) => (
                        <button
                          key={size}
                          className={`variant-btn ${selectedVariant?.size === size ? 'active' : ''}`}
                          onClick={() => {
                            const variant = product.variants.find(v => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color));
                            setSelectedVariant(variant || product.variants.find(v => v.size === size));
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.variants.some(v => v.color) && (
                  <div className="variant-group">
                    <label>Color:</label>
                    <div className="variant-options">
                      {[...new Set(product.variants.filter(v => v.color).map(v => v.color))].map((color) => (
                        <button
                          key={color}
                          className={`variant-btn ${selectedVariant?.color === color ? 'active' : ''}`}
                          onClick={() => {
                            const variant = product.variants.find(v => v.color === color && (!selectedVariant?.size || v.size === selectedVariant.size));
                            setSelectedVariant(variant || product.variants.find(v => v.color === color));
                          }}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="quantity-section">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                <button onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}>+</button>
              </div>
              <span className="stock-info">
                {getAvailableStock() > 0 ? `${getAvailableStock()} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button
                className="btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={getAvailableStock() === 0}
              >
                <FiShoppingCart /> Add to Cart
              </button>
              <button className="btn-buy-now" disabled={getAvailableStock() === 0}>
                Buy Now
              </button>
            </div>

            {/* Social Share */}
            <div className="social-share">
              <span>Share:</span>
              <button onClick={() => shareProduct('facebook')} aria-label="Share on Facebook">
                <FaFacebook />
              </button>
              <button onClick={() => shareProduct('twitter')} aria-label="Share on Twitter">
                <FaTwitter />
              </button>
              <button onClick={() => shareProduct('pinterest')} aria-label="Share on Pinterest">
                <FaPinterest />
              </button>
              <button onClick={() => shareProduct('whatsapp')} aria-label="Share on WhatsApp">
                <FaWhatsapp />
              </button>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="product-specifications">
                <h3>Specifications</h3>
                <table>
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      value && (
                        <tr key={key}>
                          <td className="spec-key">{key.charAt(0).toUpperCase() + key.slice(1)}:</td>
                          <td className="spec-value">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container reviews-section">
        <h2>Customer Reviews</h2>

        {/* Review Form */}
        {isAuthenticated ? (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>Write a Review</h3>
            <div className="rating-input">
              <label>Rating:</label>
              <div className="stars-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={star <= reviewRating ? 'filled' : ''}
                    onClick={() => setReviewRating(star)}
                  />
                ))}
              </div>
            </div>
            <textarea
              placeholder="Share your experience with this product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
            />
            <button type="submit" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="review-login-prompt">
            <p>Please <Link to="/login">login</Link> to write a review.</p>
          </div>
        )}

        {/* Review List */}
        <div className="reviews-list">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="review-author">{review.name}</div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={i < review.rating ? 'filled' : ''} />
                    ))}
                  </div>
                </div>
                <div className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                <div className="review-comment">{review.comment}</div>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="container similar-products-section">
          <h2>You May Also Like</h2>
          <div className="similar-products-grid">
            {similarProducts.map((similarProduct) => (
              <Link
                key={similarProduct._id}
                to={`/product/${similarProduct._id}`}
                className="similar-product-card"
              >
                <div className="similar-product-image">
                  <img src={similarProduct.images[0]?.url} alt={similarProduct.name} />
                </div>
                <div className="similar-product-info">
                  <h4>{similarProduct.name}</h4>
                  <div className="similar-product-price">
                    ${similarProduct.price.toFixed(2)}
                    {similarProduct.discount > 0 && (
                      <span className="discount">{similarProduct.discount}% OFF</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Add to Cart */}
      {showStickyCart && (
        <div className="sticky-cart-bar">
          <div className="container sticky-cart-content">
            <div className="sticky-product-info">
              <img src={product.images[0]?.url} alt={product.name} />
              <div>
                <h4>{product.name}</h4>
                <span className="sticky-price">${getCurrentPrice().toFixed(2)}</span>
              </div>
            </div>
            <button
              className="sticky-add-to-cart"
              onClick={handleAddToCart}
              disabled={getAvailableStock() === 0}
            >
              <FiShoppingCart /> Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
