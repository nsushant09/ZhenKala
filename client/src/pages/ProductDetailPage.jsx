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
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

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
  const [reviewName, setReviewName] = useState(user?.firstName || user?.name || '');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user) {
      setReviewName(user.firstName || user.name || '');
    }
  }, [user]);

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

    // Construct variant object if selected
    const variant = selectedVariant ? {
      id: selectedVariant._id,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: selectedVariant.price
    } : null;

    addToCart(product, quantity, variant);
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
        name: reviewName,
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
      <div className="container mx-auto px-4 py-24 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/products" className="inline-block bg-secondary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors">Back to Products</Link>
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
    <div className="bg-background pb-24">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-6 text-sm text-gray-600">
          <Link to="/" className="text-secondary hover:text-on-surface transition-colors">Home</Link>
          <span className="text-gray-400">/</span>
          <Link to="/products" className="text-secondary hover:text-on-surface transition-colors">Products</Link>
          <span className="text-gray-400">/</span>
          {product.category && (
            <>
              <Link to={`/products?category=${product.category.slug || product.category._id}`} className="text-secondary hover:text-on-surface transition-colors">
                {product.category.name}
              </Link>
              <span className="text-gray-400">/</span>
            </>
          )}
          <span>{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="sticky top-[100px] h-fit">
            <div className="w-full aspect-square bg-white rounded-xl overflow-hidden shadow-lg mb-4">
              <img src={mainImage?.url} alt={mainImage?.alt || product.name} className="w-full h-full object-cover" />
            </div>
            {displayImages.length > 1 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
                {displayImages.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${selectedImageIndex === index ? 'border-secondary' : 'border-transparent hover:border-secondary/35'}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image.url} alt={image.alt || `${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="font-secondary text-4xl text-on-surface mb-4 garamond">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`w-5 h-5 ${i < Math.round(product.rating) ? 'text-black fill-black' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-semibold text-secondary">${currentPrice.toLocaleString()}</span>
              {discount > 0 && (
                <>
                  <span className="text-2xl text-gray-500 line-through">${originalPrice.toLocaleString()}</span>
                  <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Rich Text Description */}
            <div
              className="prose prose-stone text-gray-700 mb-8 pb-8 border-b border-gray-200"
              style={{ lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Variant Selection */}
            {(uniqueSizes.length > 0 || uniqueColors.length > 0) && (
              <div className="mb-8">
                {uniqueSizes.length > 0 && (
                  <div className="mb-6">
                    <label className="block font-semibold text-on-surface mb-2 uppercase text-sm tracking-wide">Size:</label>
                    <div className="flex gap-2 flex-wrap">
                      {uniqueSizes.map(size => (
                        <button
                          key={size}
                          style={{ border: '1px solid #0000003f' }}
                          className={`px-5 py-2.5 border-2 rounded-md font-medium transition-colors ${selectedSize === size ? 'border-secondary bg-secondary text-white' : 'border-gray-300 bg-white text-on-surface focus:border-secondary'}`}
                          onClick={() => {
                            setSelectedSize(size);
                            // Auto-switch color if current combination invalid
                            const variantExists = product.variants.find(v => v.size === size && v.color === selectedColor);
                            if (!variantExists && selectedColor) {
                              const validVariant = product.variants.find(v => v.size === size);
                              if (validVariant) setSelectedColor(validVariant.color);
                            }
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {uniqueColors.length > 0 && (
                  <div className="mb-6">
                    <label className="block font-semibold text-on-surface mb-2 uppercase text-sm tracking-wide">Color:</label>
                    <div className="flex gap-2 flex-wrap">
                      {uniqueColors.map(color => (
                        <button
                          key={color}
                          className={`px-5 py-2.5 border-2 rounded-md font-medium transition-colors ${selectedColor === color ? 'border-secondary bg-secondary text-white' : 'border-gray-300 bg-white text-on-surface hover:border-secondary'}`}
                          onClick={() => {
                            setSelectedColor(color);
                            // Auto-switch size if current combination invalid
                            const variantExists = product.variants.find(v => v.color === color && v.size === selectedSize);
                            if (!variantExists && selectedSize) {
                              const validVariant = product.variants.find(v => v.color === color);
                              if (validVariant) setSelectedSize(validVariant.size);
                            }
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
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
              <label className="font-semibold text-on-surface uppercase text-sm tracking-wide">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-primary text-black text-xl font-semibold hover:opacity-80 transition-opacity">-</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-10 border-x border-gray-300 text-center font-semibold focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button onClick={() => setQuantity(Math.min(stock, quantity + 1))} className="w-10 h-10 bg-primary text-black text-xl font-semibold hover:opacity-80 transition-opacity">+</button>
              </div>
              <span className={`text-sm ${stock > 0 && stock < 5 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                {stock > 0
                  ? (stock < 5 ? `Limited Stock: Only ${stock} left` : `${stock} in stock`)
                  : 'Out of stock'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                className="flex-1 py-4 px-8 rounded-md text-lg font-semibold flex items-center justify-center gap-2 transition-opacity bg-secondary text-white border-2 border-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={stock === 0}
              >
                <FiShoppingCart /> Add to Cart
              </button>
              <button
                style={{ backgroundColor: 'var(--color-on-surface)' }}
                className="flex-1 py-4 px-8 rounded-md text-lg font-semibold flex items-center justify-center gap-2 transition-opacity text-white border-2 border-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              <span className="font-semibold text-on-surface uppercase text-sm tracking-wide">Share:</span>
              <button onClick={() => shareProduct('facebook')} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-on-surface hover:bg-secondary hover:text-secondary hover:-translate-y-0.5 transition-all"><FaFacebook className="w-5 h-5" /></button>
              <button onClick={() => shareProduct('twitter')} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-on-surface hover:bg-secondary hover:text-secondary hover:-translate-y-0.5 transition-all"><FaTwitter className="w-5 h-5" /></button>
              <button onClick={() => shareProduct('pinterest')} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-on-surface hover:bg-secondary hover:text-secondary hover:-translate-y-0.5 transition-all"><FaPinterest className="w-5 h-5" /></button>
              <button onClick={() => shareProduct('whatsapp')} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-on-surface hover:bg-secondary hover:text-secondary hover:-translate-y-0.5 transition-all"><FaWhatsapp className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto">
        <h2 className="font-secondary text-3xl mt-16 mb-8 text-on-surface text-center garamond">Customer Reviews</h2>
        {isAuthenticated ? (
          <form className="bg-white p-12 rounded-xl shadow-md mb-12 max-w-4xl mx-auto" onSubmit={handleSubmitReview}>
            <div className="form-header">
              <h3 className="garamond">Write a Review</h3>
            </div>

            <div className="form-group">
              <label>Your Name:</label>
              <input
                type="text"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>Rating:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-colors ${star <= reviewRating ? 'text-secondary fill-secondary' : 'text-gray-300 hover:text-secondary'}`}
                    onClick={() => setReviewRating(star)}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Review:</label>
              <textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                className="form-control"
                style={{ minHeight: '120px', resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={submittingReview} className="btn-form-primary">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="text-center p-12 bg-gray-100 rounded-xl mb-12">
            <p>Please <Link to="/login" className="text-secondary font-semibold hover:underline">login</Link> to write a review.</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {product.reviews?.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review._id} className="bg-white p-8 rounded-xl shadow-sm mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-on-surface">{review.name}</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'text-secondary fill-secondary' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-4">{new Date(review.createdAt).toLocaleDateString()}</div>
                <div className="text-gray-700 leading-relaxed">{review.comment}</div>
              </div>
            ))
          ) : (
            <p className="text-center p-12 text-gray-500">No reviews yet.</p>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="container mx-auto px-4 py-24 bg-white rounded-3xl mt-24">
          <h2 className="font-secondary text-3xl mb-12 text-on-surface text-center">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map((p) => (
              <Link key={p._id} to={`/products/${p._id}`} className="bg-background rounded-xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all group">
                <div className="aspect-square bg-white overflow-hidden">
                  <img src={p.images[0]?.url} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h4 className="text-base font-semibold text-on-surface mb-2 truncate">{p.name}</h4>
                  <div className="flex items-center gap-2 text-lg font-semibold text-secondary">
                    ${(p.price || 0).toFixed(2)}
                    {p.discount > 0 && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{p.discount}% OFF</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Cart Bar */}
      {showStickyCart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-50 animate-[slideUp_0.3s_ease-out] py-2">
          <div className="container mx-auto px-4 flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <img src={mainImage?.url || product.images[0]?.url} alt={product.name} className="w-[60px] h-[60px] object-cover rounded-md" />
              <div>
                <h4 className="text-base font-semibold text-on-surface mb-1 hidden sm:block">{product.name}</h4>
                <span className="text-lg font-semibold text-secondary">${currentPrice.toLocaleString()}</span>
              </div>
            </div>
            <button
              className="px-8 py-3 bg-secondary text-white rounded-md font-semibold flex items-center gap-2 transition-colors hover:bg-on-surface disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              onClick={handleAddToCart}
              disabled={stock === 0}
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
