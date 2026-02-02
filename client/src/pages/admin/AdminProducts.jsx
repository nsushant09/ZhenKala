import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiArrowLeft
} from 'react-icons/fi';
import api from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

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

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);

      // Optimistic UI update (no flicker)
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-secondary mb-6 transition-colors"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-500 text-sm">
              Manage your product catalog
            </p>
          </div>

          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-lg hover:bg-opacity-90 transition-colors shadow-sm font-medium w-fit"
          >
            <FiPlus /> Add Product
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <form
            onSubmit={handleSearch}
            className="relative flex-grow max-w-md"
          >
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </form>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
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

                      <td className="px-6 py-3 font-medium text-gray-900">
                        {product.name}
                      </td>

                      <td className="px-6 py-3 text-gray-500">
                        {product.category?.name || 'Uncategorized'}
                      </td>

                      <td className="px-6 py-3 font-medium text-gray-900">
                        ${product.price.toLocaleString()}
                      </td>

                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
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
                          className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(product._id);
                          }}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
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
            <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
