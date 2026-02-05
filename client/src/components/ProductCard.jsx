import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';

const ProductCard = ({ id, name = "Product Name", price = 0, originalPrice = 0, discount = 0, image, images = [], badge, stock = 0, variants = [] }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const { addToCart } = useCart();

    // Local state for add-to-cart animation
    const [isAdding, setIsAdding] = useState(false);

    // Use passed props directly
    // The backend now syncs price to be the actual selling price, and originalPrice as the base.
    const hasDiscount = (originalPrice > price) || (discount > 0 && originalPrice > 0);


    // Determine images to use
    const productImages = images.length > 0 ? images : (image ? [{ url: image }] : []);
    const currentImage = productImages[currentImageIndex]?.url || "https://placehold.co/400x500/e0e0e0/ffffff?text=Product";

    // Determine Badges
    const showDiscount = discount > 0;
    const showLowStock = stock > 0 && stock < 5;

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAdding) return;

        setIsAdding(true);

        // Source data for the cart item
        // If variants are available, use the first one's details for consistency with detail page
        const firstVariant = variants && variants.length > 0 ? variants[0] : null;

        // Pass the product and the variant info
        // addToCart(product, quantity, variant)
        await addToCart({ _id: id, name, price, images, stock }, 1, firstVariant ? {
            id: firstVariant._id,
            size: firstVariant.size,
            color: firstVariant.color,
            price: firstVariant.price
        } : null);

        setIsAdding(false);
    };

    return (
        <Link
            to={`/products/${id}`}
            className="block h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="bg-[#FCF9EC] rounded-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02] w-[300px] max-w-sm cursor-pointer group h-full flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-[4/5] bg-gray-200">
                    <img
                        src={currentImage}
                        alt={name}
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-0 left-0 z-10 flex flex-col gap-1 items-start">
                        {showDiscount && (
                            <div className="bg-secondary text-white text-[10px] px-3 py-1 rounded-br-sm uppercase tracking-wider font-medium shadow-sm">
                                -{discount}%
                            </div>
                        )}
                        {showLowStock && (
                            <div className="bg-black/80 text-white text-[10px] px-3 py-1 rounded-r-sm uppercase tracking-wider font-medium shadow-sm backdrop-blur-sm">
                                {stock} in stock
                            </div>
                        )}
                    </div>

                    {/* Carousel Controls */}
                    {productImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 ${currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
                            >
                                <FiChevronLeft size={18} />
                            </button>
                            <button
                                onClick={nextImage}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 ${currentImageIndex === productImages.length - 1 ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
                            >
                                <FiChevronRight size={18} />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {productImages.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-secondary' : 'bg-white/70'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Content Container */}
                <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                    <div>
                        {/* Product Name */}
                        <h3 className="text-xl text-gray-900 truncate mb-1" title={name}>{name}</h3>
                    </div>

                    {/* Price Section */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-medium text-on-background">
                                ${typeof price === 'number' ? price.toLocaleString() : price}
                            </span>
                            {hasDiscount && (
                                <span className="text-lg text-gray-400 line-through decoration-1">
                                    ${typeof originalPrice === 'number' ? originalPrice.toLocaleString() : originalPrice}
                                </span>
                            )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            className={`
                                relative overflow-hidden px-4 py-2 rounded-md text-sm transition-all duration-300 flex items-center gap-1 shadow-sm
                                ${isAdding ? 'bg-secondary cursor-default' : 'bg-secondary hover:bg-red-500 hover:scale-110'} text-white
                            `}
                            onClick={handleAddToCart}
                            disabled={isAdding}
                        >
                            {isAdding ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <><span>+</span> Cart</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
