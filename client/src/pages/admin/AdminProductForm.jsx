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
        costPrice: 0,
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
                costPrice: data.costPrice || 0,
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
            { size: '', color: '', price: 0, costPrice: 0, originalPrice: 0, stock: 10, discount: 0, isActive: true }
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
                        costPrice: firstActive.costPrice,
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
            navigate('/admin/products', { replace: true, state: { refreshList: true } });
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
        <div className="p-12 bg-background min-h-screen font-primary">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 border-b border-secondary/10 pb-8 gap-6">
                    <div className="flex items-center gap-6">
                        <Link to="/admin/products" className="text-secondary hover:opacity-70 transition-opacity">
                            <FiArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-5xl font-secondary text-gray-800 garamond mb-1">
                                {isEditMode ? 'Edit Product' : 'Add Product'}
                            </h1>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                                {isEditMode ? 'Modify existing product details' : 'Create a new product catalog entry'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-3 bg-secondary text-white px-10 py-4 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-opacity-95 shadow-2xl shadow-secondary/10 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : <><FiSave /> Save Product</>}
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                        <FiInfo size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Main Info Card */}
                    <div className="bg-white/40 backdrop-blur-md p-10 rounded-sm border border-secondary/5 shadow-sm">
                        <h3 className="text-2xl font-secondary text-gray-800 garamond mb-8 pb-4 border-b border-secondary/5 font-medium">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all appearance-none"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tags</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="e.g. thangka, gold, handmade"
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="8"
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all leading-relaxed"
                                    placeholder="Detailed product description..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex items-center gap-10 mt-10 pt-8 border-t border-secondary/5">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all ${formData.isFeatured ? 'bg-secondary border-secondary' : 'bg-white border-gray-200 group-hover:border-secondary'}`}>
                                    {formData.isFeatured && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Featured</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all ${formData.isActive ? 'bg-secondary border-secondary' : 'bg-white border-gray-200 group-hover:border-secondary'}`}>
                                    {formData.isActive && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Variants Manager */}
                    <div className="bg-white/40 backdrop-blur-md p-10 rounded-sm border border-secondary/5 shadow-sm">
                        <div className="flex justify-between items-baseline mb-10 border-b border-secondary/5 pb-6">
                            <h3 className="text-3xl font-secondary text-gray-800 garamond italic">Product Variants</h3>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-secondary hover:opacity-70 transition-opacity"
                            >
                                <FiPlus /> Add Variant
                            </button>
                        </div>

                        {variants.length === 0 ? (
                            <div className="p-20 text-center border border-dashed border-secondary/10 rounded-sm">
                                <p className="text-[11px] text-gray-400 italic font-medium">No variants added yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="px-4 pb-4">Size</th>
                                            <th className="px-4 pb-4">Color</th>
                                            <th className="px-4 pb-4">Cost Price (Rs)</th>
                                            <th className="px-4 pb-4">Orig. Price (Rs)</th>
                                            <th className="px-4 pb-4">Discount (%)</th>
                                            <th className="px-4 pb-4">Final Price (Rs)</th>
                                            <th className="px-4 pb-4">Stock</th>
                                            <th className="px-4 pb-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {variants.map((variant, index) => (
                                            <tr key={index} className="bg-white group">
                                                <td className="px-4 py-4 first:rounded-l-sm">
                                                    <input
                                                        type="text"
                                                        value={variant.size || ''}
                                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                        className="bg-transparent border-b border-transparent focus:border-secondary transition-all outline-none text-sm w-full"
                                                        placeholder="Size"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="text"
                                                        value={variant.color || ''}
                                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                        className="bg-transparent border-b border-transparent focus:border-secondary transition-all outline-none text-sm w-full"
                                                        placeholder="Color"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="number"
                                                        value={variant.costPrice || ''}
                                                        onChange={(e) => handleVariantChange(index, 'costPrice', parseFloat(e.target.value) || 0)}
                                                        className="bg-transparent border-b border-transparent focus:border-secondary transition-all outline-none text-sm w-20"
                                                        placeholder="Cost"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="number"
                                                        value={variant.originalPrice || ''}
                                                        onChange={(e) => handleVariantChange(index, 'originalPrice', parseFloat(e.target.value) || 0)}
                                                        className="bg-transparent border-b border-transparent focus:border-secondary transition-all outline-none text-sm w-20"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="number"
                                                        value={variant.discount}
                                                        onChange={(e) => handleVariantChange(index, 'discount', parseFloat(e.target.value) || 0)}
                                                        className="bg-transparent border-b border-transparent focus:border-secondary transition-all outline-none text-sm w-16"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 font-bold text-gray-800 text-sm">
                                                    {variant.price}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="number"
                                                        value={variant.stock}
                                                        onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                                                        className="bg-transparent border-b border-transparent focus:border-secondary transition-all outline-none text-sm w-16"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-right last:rounded-r-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <FiTrash2 size={16} />
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
                    <div className="bg-white/40 backdrop-blur-md p-10 rounded-sm border border-secondary/5 shadow-sm">
                        <div className="flex justify-between items-baseline mb-10 border-b border-secondary/5 pb-6">
                            <h3 className="text-3xl font-secondary text-gray-800 garamond">Product Images</h3>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-secondary hover:opacity-70 transition-opacity cursor-pointer">
                                    <FiUpload /> {uploading ? 'Uploading...' : 'Upload Image'}
                                    <input type="file" onChange={uploadFileHandler} className="hidden" accept="image/*" disabled={uploading} />
                                </label>
                                <button
                                    type="button"
                                    onClick={addImage}
                                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-secondary hover:opacity-70 transition-opacity"
                                >
                                    <FiPlus /> Add Image URL
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {images.map((img, index) => (
                                <div key={index} className="flex gap-6 p-6 bg-white rounded-sm border border-secondary/5 group relative transition-all hover:shadow-xl hover:shadow-secondary/5">
                                    <div className="w-32 h-32 bg-background flex items-center justify-center overflow-hidden rounded-sm shrink-0 border border-secondary/5">
                                        {img.url ? (
                                            <img src={img.url} alt="Preview" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" />
                                        ) : (
                                            <FiImage className="text-gray-200 text-4xl" />
                                        )}
                                    </div>

                                    <div className="flex-grow space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Image URL</label>
                                            <input
                                                type="text"
                                                value={img.url}
                                                onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                                                className="w-full bg-transparent border-b border-gray-100 focus:border-secondary transition-all outline-none text-[10px]"
                                                placeholder="URL"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Alt Text</label>
                                            <input
                                                type="text"
                                                value={img.alt}
                                                onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                                                className="w-full bg-transparent border-b border-gray-100 focus:border-secondary transition-all outline-none text-[10px]"
                                                placeholder="Alt text"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Linked Color</label>
                                            <select
                                                value={img.color || ''}
                                                onChange={(e) => handleImageChange(index, 'color', e.target.value)}
                                                className="w-full bg-transparent border-b border-gray-100 focus:border-secondary transition-all outline-none text-[10px] appearance-none"
                                            >
                                                <option value="">None</option>
                                                {uniqueColors.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={() => moveImage(index, 'up')} disabled={index === 0} className="text-gray-300 hover:text-secondary disabled:opacity-0"><FiRefreshCw size={12} className="rotate-90" /></button>
                                        <button type="button" onClick={() => removeImage(index)} className="text-gray-300 hover:text-red-500"><FiTrash2 size={12} /></button>
                                        <button type="button" onClick={() => moveImage(index, 'down')} disabled={index === images.length - 1} className="text-gray-300 hover:text-secondary disabled:opacity-0"><FiRefreshCw size={12} className="-rotate-90" /></button>
                                    </div>
                                </div>
                            ))}
                            {images.length === 0 && <p className="text-gray-400 italic text-center py-10 col-span-2 text-sm">No images added yet.</p>}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProductForm;
