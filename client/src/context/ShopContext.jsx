import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const [artisanProducts, setArtisanProducts] = useState(null);
    const [loadingArtisan, setLoadingArtisan] = useState(false);

    // Fetch Artisan Products (Cached for Homepage)
    useEffect(() => {
        const fetchArtisanProducts = async () => {
            if (artisanProducts) return; // Already cached

            setLoadingArtisan(true);
            try {
                const { data } = await api.get('/products');
                // Filter products with 'artisan-selection' tag
                const artisanSelection = data.products.filter(product =>
                    product.tags && product.tags.includes('artisan-selection')
                );
                // Map to format expected by ProductCards
                const formattedProducts = artisanSelection.map(product => ({
                    id: product._id,
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice, // Ensure this is passed
                    discount: product.discount,
                    image: product.images[0]?.url,
                    images: product.images,
                    stock: product.stock,
                    isFeatured: product.isFeatured,
                    badge: product.stock === 0 ? 'Out of Stock' : (product.isFeatured ? 'Featured' : null)
                }));
                setArtisanProducts(formattedProducts);
            } catch (error) {
                console.error('Error fetching artisan products:', error);
            } finally {
                setLoadingArtisan(false);
            }
        };

        fetchArtisanProducts();
    }, [artisanProducts]);

    const value = {
        artisanProducts,
        loadingArtisan
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};
