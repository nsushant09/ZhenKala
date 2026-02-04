import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export const useProductsViewModel = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Pagination State
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalProducts: 0
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Current Filter State from URL
    const filters = {
        category: searchParams.get('category') || 'all',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest',
        search: searchParams.get('search') || '',
        page: parseInt(searchParams.get('page')) || 1
    };

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const { data } = await api.get('/categories?tree=true');
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(location.search);

                // Clean up empty parameters to prevent backend filtering issues
                const cleanParams = new URLSearchParams();
                for (const [key, value] of params.entries()) {
                    if (value && value !== 'all' && value !== '') {
                        cleanParams.set(key, value);
                    }
                }

                // Default page
                if (!cleanParams.get('page')) cleanParams.set('page', 1);

                const { data } = await api.get(`/products?${cleanParams.toString()}`);
                setProducts(data.products);
                setPagination({
                    page: data.page,
                    totalPages: data.pages,
                    totalProducts: data.total
                });
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        // window.scrollTo(0, 0); // View responsibility
    }, [location.search]);

    // Actions
    const updateFilter = useCallback((key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }

        // Reset to page 1 for any filter change except page change itself
        if (key !== 'page') {
            newParams.set('page', 1);
        }

        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const applyPriceFilter = (min, max) => {
        const newParams = new URLSearchParams(searchParams);
        if (min) newParams.set('minPrice', min);
        else newParams.delete('minPrice');

        if (max) newParams.set('maxPrice', max);
        else newParams.delete('maxPrice');

        newParams.set('page', 1);
        setSearchParams(newParams);
    };

    const searchProducts = (term) => {
        updateFilter('search', term);
    };

    const changePage = (newPage) => {
        updateFilter('page', newPage);
        window.scrollTo(0, 0);
    };

    const selectCategory = (categoryName) => {
        updateFilter('category', categoryName);
    };

    const selectSort = (sortValue) => {
        updateFilter('sort', sortValue);
    };

    return {
        // State
        products,
        categories,
        loading,
        loadingCategories,
        pagination,
        filters,

        // Actions
        applyPriceFilter,
        searchProducts,
        changePage,
        selectCategory,
        selectSort,
    };
};
