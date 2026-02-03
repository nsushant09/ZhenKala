import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlus, FiTrash2, FiImage, FiLayers, FiUpload, FiRefreshCw } from 'react-icons/fi';
import api from '../../services/api';

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
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
            console.error(error);
            setError('Failed to fetch product details.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };

            // Auto-calculate Selling Price if Original Price or Discount changes
            if (name === 'originalPrice' || name === 'discount') {
                const orig = parseFloat(name === 'originalPrice' ? newValue : prev.originalPrice) || 0;
                const disc = parseFloat(name === 'discount' ? newValue : prev.discount) || 0;
                updated.price = Math.round(orig * (1 - disc / 100));
            }
            return updated;
        });
    };

    // --- Variants Management ---
    const addVariant = () => {
        setVariants([
            ...variants,
            { size: '', color: '', price: 0, originalPrice: 0, stock: 10, discount: 0, isActive: true }
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

        // Auto-calculate Variant Selling Price
        if (field === 'originalPrice' || field === 'discount') {
            const orig = parseFloat(field === 'originalPrice' ? value : newVariants[index].originalPrice) || 0;
            const disc = parseFloat(field === 'discount' ? value : newVariants[index].discount) || 0;
            newVariants[index].price = Math.round(orig * (1 - disc / 100));
        }
        setVariants(newVariants);
    };

    // --- Images Management ---
    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);
        setUploading(true);

        try {
            const { data } = await api.post('/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImages([...images, { url: data.imageUrl, alt: formData.name, color: '' }]);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
            alert('Image upload failed');
        }
    };

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
            // Sync Base Product Data with First Active Variant (to ensure consistency across UI)
            let finalFormData = { ...formData };
            if (variants && variants.length > 0) {
                const firstActive = variants.find(v => v.isActive) || variants[0];
                if (firstActive) {
                    finalFormData = {
                        ...finalFormData,
                        price: firstActive.price,
                        originalPrice: firstActive.originalPrice || firstActive.price,
                        discount: firstActive.discount,
                        stock: variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0) // Total stock sum? Or first variant? User said "first active variant must have base price...". But Stock is usually SUM of variants.
                        // Actually, for "Display" purposes on a Card, simple Stock check is enough. 
                        // But usually Base Stock = Sum of Variant Stocks.
                        // Let's stick to Sum for Stock, but Price/Discount from First Variant.
                    };
                    // Override the sum calculation for stock if user specifically intended "Base Stock" to match "First Variant Stock"?
                    // "The first active variant must have base price, base discount and everything"
                    // "Everything" typically implies the visual attributes.
                    // If I show "Sum" stock on card, but details page shows "First Variant" stock (which is lower)... default view is first variant.
                    // But if I want to "Add to Cart" from Card...
                    // Let's use SUM for stock (logical for a product container) but Price from First Variant.
                }
            }

            const payload = {
                ...finalFormData,
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
    const uniqueColors = [...new Set([
        ...variants.map(v => v.color).filter(Boolean)
    ])];

    if (loading && isEditMode && !formData.name) return <div className="p-8 text-center">Loading...</div>;

    const inputClasses = "w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all";
    const smallInputClasses = "w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 focus:ring-1 focus:ring-secondary outline-none";

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
                                    className={inputClasses}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={inputClasses}
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
                                    className={inputClasses}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (HTML Supported)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="6"
                                    className={`${inputClasses} font-mono text-sm`}
                                    placeholder="<p>Product description...</p>"
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-6 border-t pt-4">
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



                    {/* Variants Generator & Manager */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                                <FiLayers /> Product Variants
                            </div>
                        </div>

                        {/* GENERATOR REMOVED */}

                        {/* Variants Table */}
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-gray-700 uppercase">Active Variants</h4>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                            >
                                <FiPlus /> Add Manual Row
                            </button>
                        </div>

                        {variants.length === 0 ? (
                            <p className="text-gray-500 italic text-sm p-4 text-center border border-dashed rounded-lg">No variants generated yet. Use the generator above or add manually.</p>
                        ) : (
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">Size</th>
                                            <th className="px-4 py-3">Color</th>
                                            <th className="px-4 py-3">Original Price ($)</th>
                                            <th className="px-4 py-3">Discount (%)</th>
                                            <th className="px-4 py-3">Selling Price ($)</th>
                                            <th className="px-4 py-3">Stock</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {variants.map((variant, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={variant.size || ''}
                                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                        placeholder="Size"
                                                        className={smallInputClasses}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={variant.color || ''}
                                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                        placeholder="Color"
                                                        className={smallInputClasses}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.originalPrice || ''}
                                                        onChange={(e) => handleVariantChange(index, 'originalPrice', parseFloat(e.target.value) || 0)}
                                                        className={smallInputClasses}
                                                        style={{ width: '100px' }}
                                                        placeholder="Orig"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.discount}
                                                        onChange={(e) => handleVariantChange(index, 'discount', parseFloat(e.target.value) || 0)}
                                                        className={smallInputClasses}
                                                        style={{ width: '80px' }}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.price}
                                                        readOnly
                                                        className={`${smallInputClasses} bg-gray-50 text-gray-500`}
                                                        style={{ width: '100px' }}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.stock}
                                                        onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                                                        className={smallInputClasses}
                                                        style={{ width: '80px' }}
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
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md transition-colors cursor-pointer">
                                    <FiUpload /> {uploading ? 'Uploading...' : 'Upload Image'}
                                    <input
                                        type="file"
                                        onChange={uploadFileHandler}
                                        className="hidden"
                                        accept="image/*"
                                        disabled={uploading}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={addImage}
                                    className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    <FiPlus /> Add URL
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {images.map((img, index) => (
                                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200 group">
                                    <div className="w-24 h-24 bg-white rounded-md border border-gray-300 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
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
                                                className={smallInputClasses}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alt Text</label>
                                            <input
                                                type="text"
                                                value={img.alt}
                                                onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                                                placeholder="Description"
                                                className={smallInputClasses}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Linked Color</label>
                                            <select
                                                value={img.color || ''}
                                                onChange={(e) => handleImageChange(index, 'color', e.target.value)}
                                                className={smallInputClasses}
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
                            {images.length === 0 && <p className="text-gray-500 italic text-center py-4">No images added. Upload or add a URL.</p>}
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AdminProductForm;
