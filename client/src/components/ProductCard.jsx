import React from 'react';

const ProductCard = ({ name = "Product Name", price = 0, discount = 0, image, badge }) => {
    // Calculate discounted price if a discount exists
    const hasDiscount = discount > 0;
    const finalPrice = hasDiscount ? price - (price * (discount / 100)) : price;

    return (
        <div className="bg-[#FCF9EC] rounded-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02] w-full max-w-sm cursor-pointer group">
            {/* Image Container */}
            <div className="relative aspect-[4/5] bg-gray-200">
                <img
                    src={image || "https://placehold.co/400x500/e0e0e0/ffffff?text=Product"}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                {badge && (
                    <div className="absolute top-0 left-0 bg-secondary text-white text-[10px] px-3 py-1 rounded-tl-sm uppercase tracking-wider font-medium shadow-sm">
                        {badge}
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="p-4 space-y-3">
                {/* Product Name */}
                <h3 className="text-xl text-gray-900 truncate">{name}</h3>

                {/* Price Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-medium text-gray-900">
                            ${finalPrice.toLocaleString()}
                        </span>
                        {hasDiscount && (
                            <span className="text-lg text-gray-400 line-through decoration-1">
                                ${price.toLocaleString()}
                            </span>
                        )}

                    </div>

                    {/* Add to Cart Button */}
                    <button className="bg-secondary hover:bg-red-900 text-white px-4 py-2 rounded-md text-sm  transition-colors flex items-center gap-1">
                        <span>+</span> Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
