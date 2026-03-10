import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiArrowLeft,
    FiX,
    FiCheck,
    FiCalendar,
    FiPercent,
    FiTag
} from 'react-icons/fi';
import api from '../../services/api';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal / Form state
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCouponId, setCurrentCouponId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountPercent: '',
        startDate: '',
        endDate: '',
        isActive: true
    });

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/coupons');
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setError('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentCouponId(null);
        setFormData({
            code: '',
            discountPercent: '',
            startDate: '',
            endDate: '',
            isActive: true
        });
        setShowFormModal(true);
    };

    const openEditModal = (coupon) => {
        setIsEditing(true);
        setCurrentCouponId(coupon._id);
        setFormData({
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            startDate: new Date(coupon.startDate).toISOString().split('T')[0],
            endDate: new Date(coupon.endDate).toISOString().split('T')[0],
            isActive: coupon.isActive
        });
        setShowFormModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditing) {
                await api.put(`/coupons/${currentCouponId}`, formData);
            } else {
                await api.post('/coupons', formData);
            }
            setShowFormModal(false);
            fetchCoupons();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving coupon');
        } finally {
            setLoading(false);
        }
    };

    const initiateDelete = (coupon) => {
        setCouponToDelete(coupon);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!couponToDelete) return;

        try {
            await api.delete(`/coupons/${couponToDelete._id}`);
            setCoupons(prev => prev.filter(c => c._id !== couponToDelete._id));
            setShowDeleteModal(false);
            setCouponToDelete(null);
        } catch (error) {
            console.error('Error deleting coupon:', error);
            alert('Failed to delete coupon');
        }
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
                        <h1 className="text-5xl font-secondary text-gray-800 garamond mb-1">Promo Codes</h1>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                            Manage discounts and special offers
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-3 bg-secondary text-white px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-opacity-95 shadow-xl shadow-secondary/10 transition-all hover:-translate-y-1 active:scale-95 w-fit"
                    >
                        <FiPlus size={14} /> Create Promo Code
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-sm font-bold text-xs uppercase tracking-widest">
                        {error}
                    </div>
                )}

                {/* Coupon Table */}
                <div className="bg-white/60 backdrop-blur-lg rounded-sm border border-secondary/5 overflow-hidden shadow-2xl">
                    {loading && coupons.length === 0 ? (
                        <div className="p-32 text-center">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="w-12 h-12 bg-secondary/10 rounded-full mb-4"></div>
                                <p className="garamond text-xl text-gray-400">Loading coupons...</p>
                            </div>
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="p-32 text-center">
                            <p className="garamond text-xl text-gray-400">No promo codes found in the database.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-secondary text-white uppercase text-[10px] font-bold tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5">Promo Code</th>
                                        <th className="px-8 py-5">Discount</th>
                                        <th className="px-8 py-5">Start Date</th>
                                        <th className="px-8 py-5">End Date</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-secondary/5 font-primary">
                                    {coupons.map((coupon) => {
                                        const now = new Date();
                                        // Use local date part for comparison to match the visual 'today'
                                        const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                                        const startStr = new Date(coupon.startDate).toISOString().split('T')[0];
                                        const endStr = new Date(coupon.endDate).toISOString().split('T')[0];

                                        const isExpired = nowStr > endStr;
                                        const isNotStarted = nowStr < startStr;
                                        const isActive = coupon.isActive && !isExpired && !isNotStarted;
                                        console.log('Coupon Check:', { code: coupon.code, nowStr, startStr, isNotStarted });

                                        return (
                                            <tr
                                                key={coupon._id}
                                                className="hover:bg-white/40 transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <FiTag className="text-secondary" />
                                                        <span className="font-bold text-gray-800 text-sm tracking-widest uppercase">
                                                            {coupon.code}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 font-bold text-secondary text-sm">
                                                        <FiPercent size={14} />
                                                        {coupon.discountPercent}%
                                                    </div>
                                                </td>

                                                <td className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                    {new Date(coupon.startDate).toLocaleDateString()}
                                                </td>

                                                <td className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                    {new Date(coupon.endDate).toLocaleDateString()}
                                                </td>

                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                                                            {isExpired ? 'Expired' : isNotStarted ? 'Scheduled' : coupon.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(coupon)}
                                                            className="text-gray-400 hover:text-secondary transition-all p-2 rounded-full hover:bg-secondary/5"
                                                            title="Edit Coupon"
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() => initiateDelete(coupon)}
                                                            className="text-gray-400 hover:text-red-600 transition-all p-2 rounded-full hover:bg-red-50"
                                                            title="Delete Coupon"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-sm shadow-2xl max-w-md w-full p-8 border border-secondary/10 transform transition-all overflow-hidden relative">
                        <button
                            onClick={() => setShowFormModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-secondary transition-colors"
                        >
                            <FiX size={24} />
                        </button>

                        <h2 className="text-3xl font-secondary garamond mb-6 border-b border-secondary/10 pb-4">
                            {isEditing ? 'Edit Promo Code' : 'New Promo Code'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <FiTag /> Promo Code
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="E.G. NEWYEAR2024"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all uppercase tracking-widest"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <FiPercent /> Discount Percentage
                                </label>
                                <input
                                    type="number"
                                    name="discountPercent"
                                    value={formData.discountPercent}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    max="100"
                                    placeholder="E.G. 15"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <FiCalendar /> Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <FiCalendar /> End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-sm border border-gray-100">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                                />
                                <label htmlFor="isActive" className="text-[10px] font-bold uppercase tracking-widest text-gray-600 cursor-pointer">
                                    Coupon is active for use
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="px-6 py-3 text-gray-400 hover:text-gray-600 transition-colors font-bold text-[10px] uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-secondary text-white rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-opacity-95 shadow-lg shadow-secondary/10 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : isEditing ? 'Update Code' : 'Create Code'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-sm shadow-2xl max-w-md w-full p-8 border border-secondary/10 transform transition-all overflow-hidden relative">
                        <h2 className="text-3xl font-secondary garamond mb-6 border-b border-secondary/10 pb-4">
                            Confirm Deletion
                        </h2>

                        <p className="text-gray-500 mb-8 font-primary leading-relaxed">
                            Are you sure you want to delete the promo code <span className="text-secondary font-bold tracking-widest">"{couponToDelete?.code}"</span>?
                            This will prevent users from applying this discount in the future.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-3 text-gray-400 hover:text-gray-600 transition-colors font-bold text-[10px] uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="px-8 py-3 bg-red-600 text-white rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/10 transition-all"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
