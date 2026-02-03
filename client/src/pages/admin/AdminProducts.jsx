import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiArrowLeft,
  FiX
} from 'react-icons/fi';
import api from '../../services/api';

const AdminProducts = () => {
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/products?page=${page}&limit=20&search=${search}`
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
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 text-sm">
              Manage your product catalog
            </p>
          </div>

          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-lg hover:bg-opacity-90 shadow-sm  w-fit"
          >
            <FiPlus /> Add Product
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-surface p-4 rounded-xl shadow-lg border border-black/10 mb-6">
          <form
            onSubmit={handleSearch}
            className="relative flex-grow max-w-md"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-primary border border-black/10 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 px-3 text-gray-400 hover:text-secondary transition-colors"
            >
              <FiSearch size={20} />
            </button>
          </form>
        </div>

        {/* Product Table */}
        <div className="bg-surface rounded-xl shadow-lg border border-black/10 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-primary text-black uppercase text-xs font-semibold tracking-wider border-b border-black/10">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Original Price</th>
                    <th className="px-6 py-4">Selling Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-primary-light/10">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-black/5 transition-colors"
                    >
                      <td className="px-6 py-3 font-mono text-xs text-gray-500">
                        {product._id.substring(product._id.length - 6)}
                      </td>

                      <td className="px-6 py-3">
                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-black/10">
                          <img
                            src={
                              product.images[0]?.url ||
                              'https://placehold.co/100?text=No+Img'
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="px-6 py-3 font-medium text-black">
                        {product.name}
                      </td>

                      <td className="px-6 py-3 text-gray-400">
                        {product.category?.name || 'Uncategorized'}
                      </td>

                      <td className="px-6 py-3 text-gray-400 line-through">
                        {product.originalPrice ? `$${product.originalPrice.toLocaleString()}` : '-'}
                      </td>

                      <td className="px-6 py-3 font-medium text-black">
                        ${product.price.toLocaleString()}
                      </td>

                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                            }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} in stock`
                            : 'Out of Stock'}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-right flex items-center justify-end gap-3">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            initiateDelete(product);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t border-primary-light/20">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-primary-light/30 rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-light/10 text-sm font-medium text-gray-300"
              >
                Previous
              </button>

              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-primary-light/30 rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-light/10 text-sm font-medium text-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-primary-dark rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-primary-light/30 transform transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Deletion</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{productToDelete?.name}</span>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium shadow-sm shadow-red-500/30"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
