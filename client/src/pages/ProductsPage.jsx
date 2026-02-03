import React, { useState, useEffect } from 'react';
import ProductCards from '../components/ProductCards';
import Divider from '../components/Divider';
import { FiFilter, FiX, FiChevronDown, FiChevronRight, FiSearch, FiShoppingBag } from 'react-icons/fi';
import { useProductsViewModel } from '../hooks/useProductsViewModel';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductsPage = () => {
  // ViewModel integration
  const {
    products,
    categories,
    loading,
    pagination,
    filters,
    applyPriceFilter,
    searchProducts,
    changePage,
    selectCategory,
    selectSort,
  } = useProductsViewModel();

  // Local UI State
  const [showSidebar, setShowSidebar] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Local form state (for delayed application)
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice);

  // Sync local state when filters change externally (e.g. back button)
  useEffect(() => {
    setLocalSearch(filters.search);
    setLocalMinPrice(filters.minPrice);
    setLocalMaxPrice(filters.maxPrice);
  }, [filters.search, filters.minPrice, filters.maxPrice]);


  // Handlers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchProducts(localSearch);
  };

  const handlePriceSubmit = () => {
    applyPriceFilter(localMinPrice, localMaxPrice);
  };

  const handleCategoryClick = (catName) => {
    selectCategory(catName);
    setShowSidebar(false);
  };

  const toggleCategoryExpand = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const renderCategoryTree = (cats, depth = 0) => {
    return cats.map(cat => (
      <div key={cat._id} className="select-none">
        <div
          className={`flex items-center justify-between py-2 px-2 rounded-md cursor-pointer transition-colors ${filters.category === cat.name
            ? 'bg-secondary text-white font-medium'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <span
            className="flex-grow"
            onClick={() => handleCategoryClick(cat.name)}
          >
            {cat.name}
          </span>
          {cat.children && cat.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategoryExpand(cat._id);
              }}
              className="p-1 hover:bg-black/10 rounded-full"
            >
              {expandedCategories[cat._id] ? <FiChevronDown /> : <FiChevronRight />}
            </button>
          )}
        </div>
        {cat.children && cat.children.length > 0 && expandedCategories[cat._id] && (
          <div className="border-l border-gray-200 ml-4">
            {renderCategoryTree(cat.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Global CSS for removing number arrows
  const globalStyles = `
        /* Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
        }

        /* Firefox */
        input[type=number] {
        -moz-appearance: textfield;
        }
    `;

  return (
    <div className="bg-background min-h-screen pt-8 pb-16">
      <style>{globalStyles}</style>
      <div className="container mx-auto px-4">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2 capitalize">
              {filters.category === 'all' ? 'All Products' : filters.category}
            </h1>
            <p className="text-gray-500">
              Showing {products.length} of {pagination.totalProducts} results
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-grow md:flex-grow-0 md:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary bg-white"
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 text-secondary hover:text-red-800 transition-colors flex items-center justify-center">
                <FiSearch size={20} />
              </button>
            </form>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => selectSort(e.target.value)}
                className="px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary bg-white cursor-pointer appearance-none"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              className="md:hidden p-2 border border-gray-300 rounded-md bg-white text-gray-600"
              onClick={() => setShowSidebar(true)}
            >
              <FiFilter size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 relative">

          {/* Sidebar / Filters */}
          <aside className={`
                        fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white md:bg-transparent shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out p-6 md:p-0 overflow-y-auto md:overflow-visible
                        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        md:block md:w-1/4 lg:w-1/5
                    `}>
            <div className="flex justify-between items-center md:hidden mb-6">
              <h2 className="text-xl font-medium">Filters</h2>
              <button onClick={() => setShowSidebar(false)}>
                <FiX size={24} />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-lg font-serif border-b border-gray-200 pb-2 mb-4">Categories</h3>
              <div className="space-y-1">
                <div
                  className={`py-2 px-2 rounded-md cursor-pointer transition-colors ${filters.category === 'all'
                    ? 'bg-secondary text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  onClick={() => handleCategoryClick('all')}
                >
                  All Products
                </div>
                {renderCategoryTree(categories)}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="text-lg font-serif border-b border-gray-200 pb-2 mb-4">Price Range</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-secondary"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-secondary"
                  />
                </div>
                <button
                  onClick={handlePriceSubmit}
                  className="w-full bg-secondary text-white py-2 rounded-md text-sm hover:bg-primary hover:text-secondary font-medium transition-colors border border-transparent hover:border-secondary"
                >
                  Apply Filter
                </button>
              </div>
            </div>

          </aside>

          {/* Overlay for Mobile */}
          {showSidebar && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowSidebar(false)}
            ></div>
          )}

          {/* Product Grid */}
          <div className="w-full md:w-3/4 lg:w-4/5">
            {loading ? (
              <LoadingSpinner />
            ) : products.length > 0 ? (
              <>
                <ProductCards products={products} />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-12 gap-2">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => changePage(pagination.page - 1)}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
                    >
                      Previous
                    </button>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => changePage(i + 1)}
                        className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${pagination.page === i + 1
                          ? 'bg-secondary text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => changePage(pagination.page + 1)}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <FiShoppingBag size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  We couldn't find any products matching your selection. Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setLocalSearch('');
                    setLocalMinPrice('');
                    setLocalMaxPrice('');
                    searchProducts('');
                    applyPriceFilter('', '');
                    selectCategory('all');
                  }}
                  className="mt-6 px-6 py-2 bg-secondary text-white rounded-md hover:bg-red-800 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
