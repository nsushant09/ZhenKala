import React from 'react';
import ProductCard from './ProductCard';

const ProductCards = ({ products = [] }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center w-full">
                <p className="text-gray-500 font-light italic">No items available at this time.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-x-[16px] gap-y-[32px] justify-center md:justify-start my-[32px]">
            {products.map((product, index) => (
                <div key={product.id || index} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex justify-center">
                    <ProductCard
                        name={product.name}
                        price={product.price}
                        discount={product.discount}
                        image={product.image}
                        badge={product.badge}
                    />
                </div>
            ))}
        </div>
    );
};

export default ProductCards;
