import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiSave, FiInfo } from 'react-icons/fi';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

const AdminMiscellaneous = () => {
    const { formatPrice } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [settings, setSettings] = useState({
        deliveryCharges: {
            nepal: 130,
            international: 2000
        },
        freeShippingThreshold: 13000
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/merchant-details');
            if (data) {
                setSettings({
                    deliveryCharges: data.deliveryCharges || { nepal: 130, international: 2000 },
                    freeShippingThreshold: data.freeShippingThreshold || 13000
                });
            }
        } catch (err) {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChargeChange = (location, value) => {
        setSettings(prev => ({
            ...prev,
            deliveryCharges: {
                ...prev.deliveryCharges,
                [location]: value
            }
        }));
    };

    const handleThresholdChange = (value) => {
        setSettings(prev => ({
            ...prev,
            freeShippingThreshold: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            const finalSettings = {
                ...settings,
                deliveryCharges: {
                    nepal: Number(settings.deliveryCharges.nepal) || 0,
                    international: Number(settings.deliveryCharges.international) || 0
                },
                freeShippingThreshold: Number(settings.freeShippingThreshold) || 0
            };
            const { data } = await api.put('/merchant-details', finalSettings);
            if (data) {
                setSettings({
                    deliveryCharges: data.deliveryCharges || { nepal: 130, international: 2000 },
                    freeShippingThreshold: data.freeShippingThreshold || 13000
                });
            }
            setSuccess('Settings updated successfully');
        } catch (err) {
            setError('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center animate-pulse">
                <p className="garamond text-2xl text-gray-400">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="p-12 bg-background min-h-screen">
            <div className="max-w-4xl mx-auto">
                <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-widest mb-10 hover:opacity-70 transition-opacity"
                >
                    <FiArrowLeft /> Back to Dashboard
                </Link>

                <div className="mb-12 border-b border-secondary/10 pb-8">
                    <h1 className="text-5xl font-secondary text-gray-800 garamond mb-2">Miscellaneous Settings</h1>
                    <p className="text-secondary text-xs font-bold uppercase tracking-[0.3em] opacity-80">Global configurations & Delivery logic</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-sm font-bold text-xs uppercase tracking-widest">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-8 p-4 bg-green-50 text-green-600 border border-green-100 rounded-sm font-bold text-xs uppercase tracking-widest">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Delivery Charges Section */}
                    <div className="bg-white/40 backdrop-blur-md p-10 rounded-sm border border-secondary/5 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-secondary text-white rounded-full">
                                <FiTruck size={20} />
                            </div>
                            <h2 className="text-2xl font-secondary text-gray-800 garamond">Delivery Charges (NPR)</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Nepal (Local)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.deliveryCharges.nepal}
                                        onChange={(e) => handleChargeChange('nepal', e.target.value)}
                                        className="w-full bg-white border border-gray-100 px-4 py-4 text-sm focus:outline-none focus:border-secondary transition-all"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">NPR</span>
                                </div>
                                <p className="text-[9px] text-gray-400">Current Local: {formatPrice(settings.deliveryCharges.nepal)}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">International</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.deliveryCharges.international}
                                        onChange={(e) => handleChargeChange('international', e.target.value)}
                                        className="w-full bg-white border border-gray-100 px-4 py-4 text-sm focus:outline-none focus:border-secondary transition-all"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">NPR</span>
                                </div>
                                <p className="text-[9px] text-gray-400">Current Intl: {formatPrice(settings.deliveryCharges.international)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Free Shipping threshold */}
                    <div className="bg-white/40 backdrop-blur-md p-10 rounded-sm border border-secondary/5 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-secondary text-white rounded-full">
                                <FiInfo size={20} />
                            </div>
                            <h2 className="text-2xl font-secondary text-gray-800 garamond">Shipping Threshold (NPR)</h2>
                        </div>

                        <div className="space-y-2 max-w-md">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Free Shipping Above</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={settings.freeShippingThreshold}
                                    onChange={(e) => handleThresholdChange(e.target.value)}
                                    className="w-full bg-white border border-gray-100 px-4 py-4 text-sm focus:outline-none focus:border-secondary transition-all"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">NPR</span>
                            </div>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest">Currently Free at {formatPrice(settings.freeShippingThreshold)}</p>
                        </div>
                    </div>

                    <div className="flex justify-start">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-3 bg-secondary text-white px-10 py-5 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-opacity-95 transition-all shadow-xl shadow-secondary/10 active:scale-95 disabled:opacity-50"
                        >
                            <FiSave /> {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminMiscellaneous;
