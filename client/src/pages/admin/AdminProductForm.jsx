import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlus, FiTrash2, FiImage, FiLayers } from 'react-icons/fi';
import api from '../../services/api';

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: 0,
        originalPrice: 0,
        discount: 0,
        stock: 0,
        isFeatured: false,
        isActive: true,
        tags: '',
    });

    const [variants, setVariants] = useState([]);
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/products/${id}`);
            setFormData({
                name: data.name,
                category: data.category?._id || data.category,
                description: data.description,
                price: data.price,
                originalPrice: data.originalPrice || 0,
                discount: data.discount || 0,
                stock: data.stock,
                isFeatured: data.isFeatured,
                isActive: data.isActive,
                tags: data.tags ? data.tags.join(', ') : '',
            });
            setVariants(data.variants || []);
            setImages(data.images || []);
        } catch (error) {
            setError('Failed to fetch product details.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // --- Variants Management ---
    const addVariant = () => {
        setVariants([
            ...variants,
            { size: '', color: '', price: formData.price, stock: 10, discount: 0, isActive: true }
        ]);
    };

    const removeVariant = (index) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        setVariants(newVariants);
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    // --- Images Management ---
    const addImage = () => {
        setImages([...images, { url: '', alt: '', color: '' }]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleImageChange = (index, field, value) => {
        const newImages = [...images];
        newImages[index][field] = value;
        setImages(newImages);
    };

    const moveImage = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === images.length - 1) return;

        const newImages = [...images];
        const temp = newImages[index];
        newImages[index] = newImages[index + (direction === 'up' ? -1 : 1)];
        newImages[index + (direction === 'up' ? -1 : 1)] = temp;
        setImages(newImages);
    };

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                variants,
                images: images.filter(img => img.url), // Filter out empty images
            };

            if (isEditMode) {
                await api.put(`/products/${id}`, payload);
            } else {
                await api.post('/products', payload);
            }
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
            setError(error.response?.data?.message || 'Failed to save product.');
        } finally {
            setLoading(false);
        }
    };

    // Helper: Get unique colors for dropdown
    const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))];

    if (loading && isEditMode && !formData.name) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/products" className="text-gray-500 hover:text-gray-700">
                            <FiArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isEditMode ? 'Edit Product' : 'Add New Product'}
                        </h1>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 bg-secondary text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 transition-colors shadow-sm font-medium"
                    >
                        <FiSave />
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-700 border-b pb-2">
                            <FiLayers /> Basic Information
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="e.g. thangka, gold, handmade"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (HTML Supported)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="6"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all font-mono text-sm"
                                    placeholder="<p>Product description...</p>"
                                ></textarea>
                                <p className="text-xs text-gray-500 mt-1">Use HTML tags for formatting (e.g., &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;).</p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Stock Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-700 border-b pb-2">
                            Basic Pricing & Stock (Fallbacks)
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
                                <input
                                    type="number"
                                    name="originalPrice"
                                    value={formData.originalPrice}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    name="discount"
                                    value={formData.discount}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-secondary rounded focus:ring-secondary"
                                />
                                <span className="text-gray-700 font-medium">Featured Product</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-secondary rounded focus:ring-secondary"
                                />
                                <span className="text-gray-700 font-medium">Active (Visible)</span>
                            </label>
                        </div>
                    </div>

                    {/* Variants Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                                <FiLayers /> Product Variants
                            </div>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                            >
                                <FiPlus /> Add Variant
                            </button>
                        </div>

                        {variants.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">No variants added. Product will use base price/stock.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 uppercase font-medium">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Size</th>
                                            <th className="px-4 py-3">Color</th>
                                            <th className="px-4 py-3">Price ($)</th>
                                            <th className="px-4 py-3">Stock</th>
                                            <th className="px-4 py-3">Discount (%)</th>
                                            <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {variants.map((variant, index) => (
                                            <tr key={index} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={variant.size}
                                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                        placeholder="e.g. Small"
                                                        className="w-full bg-transparent border-none focus:ring-0 p-0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={variant.color}
                                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                        placeholder="e.g. Red"
                                                        className="w-full bg-transparent border-none focus:ring-0 p-0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.price}
                                                        onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                        className="w-24 bg-transparent border-none focus:ring-0 p-0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.stock}
                                                        onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                                                        className="w-20 bg-transparent border-none focus:ring-0 p-0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.discount}
                                                        onChange={(e) => handleVariantChange(index, 'discount', parseFloat(e.target.value) || 0)}
                                                        className="w-16 bg-transparent border-none focus:ring-0 p-0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Images Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                                <FiImage /> Product Images
                            </div>
                            <button
                                type="button"
                                onClick={addImage}
                                className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                            >
                                <FiPlus /> Add Image URL
                            </button>
                        </div>

                        <div className="space-y-4">
                            {images.map((img, index) => (
                                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-100 group">
                                    <div className="w-24 h-24 bg-white rounded-md border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                                        {img.url ? (
                                            <img src={img.url} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/100?text=Error'} />
                                        ) : (
                                            <FiImage className="text-gray-300 text-3xl" />
                                        )}
                                    </div>

                                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Image URL</label>
                                            <input
                                                type="text"
                                                value={img.url}
                                                onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-secondary focus:border-secondary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alt Text</label>
                                            <input
                                                type="text"
                                                value={img.alt}
                                                onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                                                placeholder="Description"
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-secondary focus:border-secondary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Linked Color</label>
                                            <select
                                                value={img.color || ''}
                                                onChange={(e) => handleImageChange(index, 'color', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-secondary focus:border-secondary outline-none"
                                            >
                                                <option value="">All / None</option>
                                                {uniqueColors.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => moveImage(index, 'up')}
                                            disabled={index === 0}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <FiTrash2 />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveImage(index, 'down')}
                                            disabled={index === images.length - 1}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {images.length === 0 && <p className="text-gray-500 italic text-center py-4">No images added.</p>}
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AdminProductForm;
