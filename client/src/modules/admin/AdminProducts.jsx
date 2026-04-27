import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiArrowLeft,
  FiX
} from 'react-icons/fi';
import api from '@/services/api';
import { useCurrency } from '@/app/providers/CurrencyContext';
import ConfirmModal from '@/components/ConfirmModal';

const AdminProducts = () => {
  const { formatPrice } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  // Refetch when returning from add/edit so the list updates
  useEffect(() => {
    if (location.state?.refreshList) {
      fetchProducts();
      navigate('/admin/products', { replace: true, state: {} });
    }
  }, [location.state]);

  useEffect(() => {
    const onFocus = () => {
      fetchProducts();
    };

    const intervalId = setInterval(() => {
      fetchProducts();
    }, 30000);

    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/products?page=${page}&limit=20&search=${search}&all=true&_t=${Date.now()}`
      );
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await api.delete(`/products/${productToDelete._id}`);
      setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(localSearch);
    setPage(1);
  };

  return (
    <div className="p-12 bg-background min-h-screen font-primary">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-widest mb-10 hover:opacity-70 transition-opacity"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 border-b border-secondary/10 pb-6 gap-6">
          <div>
            <h1 className="text-5xl font-secondary text-gray-800 garamond mb-1">Product Catalog</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Manage the collection of store products
            </p>
          </div>

          <Link
            to="/admin/products/new"
            className="flex items-center gap-3 bg-secondary text-white px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-opacity-95 shadow-xl shadow-secondary/10 transition-all hover:-translate-y-1 active:scale-95 w-fit text-white"
          >
            <FiPlus size={14} /> Add New Product
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-sm border border-secondary/5 mb-10 shadow-sm max-w-xl">
          <form
            onSubmit={handleSearch}
            className="relative"
          >
            <input
              type="text"
              placeholder="Search by name, SKU, or ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white border border-gray-100 rounded-sm text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-secondary transition-all"
            />
            <FiSearch className="absolute right-4 top-3.5 text-gray-300" size={18} />
          </form>
        </div>

        {/* Product Table */}
        <div className="bg-white/60 backdrop-blur-lg rounded-sm border border-secondary/5 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-32 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full mb-4"></div>
                <p className="garamond text-xl text-gray-400">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-32 text-center">
              <p className="garamond text-xl text-gray-400">No products found in the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-secondary text-white uppercase text-[10px] font-bold tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5">Ref / SKU</th>
                    <th className="px-8 py-5">Image</th>
                    <th className="px-8 py-5">Product Name</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5">Original Price</th>
                    <th className="px-8 py-5">Sale Price</th>
                    <th className="px-8 py-5">Stock Level</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-secondary/5 font-primary">
                  {products.map((product) => (
                    (() => {
                      const computedStock = (product.variants && product.variants.length > 0)
                        ? product.variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0)
                        : (Number(product.stock) || 0);

                      return (
                    <tr
                      key={product._id}
                      className="hover:bg-white/40 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-mono text-[11px] text-gray-400 uppercase">
                            ID: {product._id.substring(product._id.length - 6)}
                          </span>
                          {product.sku && (
                            <span className="font-black text-[9px] text-secondary uppercase tracking-widest bg-secondary/5 px-2 py-0.5 rounded-full w-fit">
                              {product.sku}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="w-14 h-18 bg-white p-1 border border-gray-100 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          <img
                            src={product.images[0]?.url || 'https://placehold.co/100?text=No+Img'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="px-8 py-6 font-bold text-gray-800 text-sm">
                        {product.name}
                      </td>

                      <td className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {product.category?.name || 'General'}
                      </td>

                      <td className="px-8 py-6 text-gray-400 text-xs line-through">
                        {product.originalPrice ? formatPrice(product.originalPrice) : '-'}
                      </td>

                      <td className="px-8 py-6 font-bold text-secondary text-sm">
                        {formatPrice(product.price)}
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${computedStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                            {computedStock > 0 ? `${computedStock} Units` : 'Out of Stock'}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="text-gray-400 hover:text-secondary transition-all p-2 rounded-full hover:bg-secondary/5"
                            title="Edit Product"
                          >
                            <FiEdit2 size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              initiateDelete(product);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-all p-2 rounded-full hover:bg-red-50"
                            title="Delete Product"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                      );
                    })()
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 p-8 border-t border-secondary/5 bg-white/40">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center border border-secondary/10 rounded-full disabled:opacity-20 hover:bg-secondary hover:text-white transition-all text-secondary"
              >
                <FiArrowLeft size={14} />
              </button>

              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 flex items-center justify-center border border-secondary/10 rounded-full disabled:opacity-20 hover:bg-secondary hover:text-white transition-all text-secondary"
              >
                <FiArrowLeft size={14} className="rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminProducts;
