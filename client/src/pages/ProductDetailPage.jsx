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
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [showStickyCart, setShowStickyCart] = useState(false);

  // Reviews State
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

      // Initialize selection based on available variants
      if (data.variants && data.variants.length > 0) {
        // Prefer first variant's attributes
        const firstVar = data.variants[0];
        if (firstVar.size) setSelectedSize(firstVar.size);
        if (firstVar.color) setSelectedColor(firstVar.color);
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

  // Helper: Find active variant based on current selection
  const getSelectedVariant = () => {
    if (!product?.variants || product.variants.length === 0) return null;
    return product.variants.find(v =>
      (v.size === selectedSize || (!v.size && !selectedSize)) &&
      (v.color === selectedColor || (!v.color && !selectedColor))
    );
  };

  const selectedVariant = getSelectedVariant();

  // Helper: Get displayable price/stock/discount
  const getCurrentPrice = () => {
    if (selectedVariant) return selectedVariant.price;
    return product?.price || 0;
  };

  const getOriginalPrice = () => {
    if (selectedVariant && selectedVariant.originalPrice) return selectedVariant.originalPrice;
    if (selectedVariant) return selectedVariant.price; // fallback if no original price set
    return product?.originalPrice || product?.price || 0;
  };

  const getDiscount = () => {
    if (selectedVariant) return selectedVariant.discount || 0;
    return product?.discount || 0;
  };

  const getStock = () => {
    if (selectedVariant) return selectedVariant.stock;
    return product?.stock || 0;
  };

  // Helper: Get images filtered by color
  const getDisplayImages = () => {
    if (!product) return [];
    if (selectedColor) {
      // Show images that match the selected color OR have no color assigned (generic)
      const filtered = product.images.filter(img => !img.color || img.color === selectedColor);
      return filtered.length > 0 ? filtered : product.images;
    }
    return product.images;
  };

  const displayImages = getDisplayImages();

  // Reset selected image index if filtered images list changes and index is out of bounds
  useEffect(() => {
    if (selectedImageIndex >= displayImages.length) {
      setSelectedImageIndex(0);
    }
  }, [displayImages.length]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      product: product._id,
      name: product.name,
      price: getCurrentPrice(),
      image: displayImages[0]?.url,
      quantity,
      variant: selectedVariant ? {
        id: selectedVariant._id, // If needed for backend tracking
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
      fetchProduct(); // Refresh
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

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center py-20">
        <h2>Product not found</h2>
        <Link to="/products" className="btn-primary mt-4 inline-block">Back to Products</Link>
      </div>
    );
  }

  // Derived Values for UI
  const currentPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const discount = getDiscount();
  const stock = getStock();
  const mainImage = displayImages[selectedImageIndex] || displayImages[0];

  // Get unique options for UI
  const uniqueSizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean))];
  const uniqueColors = [...new Set(product.variants?.map(v => v.color).filter(Boolean))];

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/products?category=${product.category.slug || product.category._id}`}>
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span>{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container product-main-section">
        <div className="product-grid">
          {/* Image Gallery */}
          <div className="product-images">
            <div className="main-image">
              <img src={mainImage?.url} alt={mainImage?.alt || product.name} />
            </div>
            {displayImages.length > 1 && (
              <div className="image-thumbnails">
                {displayImages.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
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
              <span className="current-price">${currentPrice.toLocaleString()}</span>
              {discount > 0 && (
                <>
                  <span className="original-price">${originalPrice.toLocaleString()}</span>
                  <span className="discount-badge">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Rich Text Description */}
            <div
              className="product-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Variant Selection */}
            {(uniqueSizes.length > 0 || uniqueColors.length > 0) && (
              <div className="variant-selection">
                {uniqueSizes.length > 0 && (
                  <div className="variant-group">
                    <label>Size:</label>
                    <div className="variant-options">
                      {uniqueSizes.map(size => (
                        <button
                          key={size}
                          className={`variant-btn ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {uniqueColors.length > 0 && (
                  <div className="variant-group">
                    <label>Color:</label>
                    <div className="variant-options">
                      {uniqueColors.map(color => (
                        <button
                          key={color}
                          className={`variant-btn ${selectedColor === color ? 'active' : ''}`}
                          onClick={() => setSelectedColor(color)}
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
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button onClick={() => setQuantity(Math.min(stock, quantity + 1))}>+</button>
              </div>
              <span className="stock-info">
                {stock > 0 ? `${stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button
                className="btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={stock === 0}
              >
                <FiShoppingCart /> Add to Cart
              </button>
              <button
                className="btn-buy-now"
                disabled={stock === 0}
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
              >
                Buy Now
              </button>
            </div>

            {/* Social Share */}
            <div className="social-share">
              <span>Share:</span>
              <button onClick={() => shareProduct('facebook')}><FaFacebook /></button>
              <button onClick={() => shareProduct('twitter')}><FaTwitter /></button>
              <button onClick={() => shareProduct('pinterest')}><FaPinterest /></button>
              <button onClick={() => shareProduct('whatsapp')}><FaWhatsapp /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container reviews-section">
        <h2>Customer Reviews</h2>
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
              placeholder="Share your experience..."
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

        <div className="reviews-list">
          {product.reviews?.length > 0 ? (
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
                <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                <div className="review-comment">{review.comment}</div>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet.</p>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="container similar-products-section">
          <h2>You May Also Like</h2>
          <div className="similar-products-grid">
            {similarProducts.map((p) => (
              <Link key={p._id} to={`/products/${p._id}`} className="similar-product-card">
                <div className="similar-product-image">
                  <img src={p.images[0]?.url} alt={p.name} />
                </div>
                <div className="similar-product-info">
                  <h4>{p.name}</h4>
                  <div className="similar-product-price">
                    ${(p.price || 0).toFixed(2)}
                    {p.discount > 0 && <span className="discount">{p.discount}% OFF</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Cart Bar */}
      {showStickyCart && (
        <div className="sticky-cart-bar">
          <div className="container sticky-cart-content">
            <div className="sticky-product-info">
              <img src={mainImage?.url || product.images[0]?.url} alt={product.name} />
              <div>
                <h4>{product.name}</h4>
                <span className="sticky-price">${currentPrice.toLocaleString()}</span>
              </div>
            </div>
            <button className="sticky-add-to-cart" onClick={handleAddToCart} disabled={stock === 0}>
              <FiShoppingCart /> Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
