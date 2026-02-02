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
        <div className="flex flex-wrap justify-center items-center gap-[16px] my-[32px]">
            {products.map((product, index) => (
                <div key={product.id || index} className="">
                    <ProductCard
                        id={product.id || product._id}
                        name={product.name}
                        price={product.price}
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
