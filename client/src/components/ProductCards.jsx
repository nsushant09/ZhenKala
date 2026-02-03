import React from 'react';
import ProductCard from './ProductCard';

const ProductCards = ({ products = [] }) => {
    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center w-full py-12 text-center text-gray-500">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                </div>
                <p className="text-lg font-medium text-gray-900">No items found</p>
                <p className="text-sm mt-1 max-w-xs mx-auto">These items are currently unavailable or do not match your criteria.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap justify-center items-center gap-[16px] my-[32px]">
            {products.map((product, index) => (
                <div key={product.id || index} className="flex justify-center">
                    <ProductCard
                        id={product.id || product._id}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        discount={product.discount}
                        image={product.image}
                        images={product.images}
                        badge={product.badge}
                    />
                </div>
            ))}
        </div>
    );
};

export default ProductCards;
