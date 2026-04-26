import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import './AdminMerchantSettings.css';

const AdminMerchantSettings = () => {
    const [details, setDetails] = useState({
        businessName: '',
        bankDetails: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            swiftCode: '',
            iban: '',
            branchName: ''
        },
        contactEmail: '',
        contactPhone: '',
        address: '',
        paypalEmail: '',
        taxId: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await api.get('/merchant-details');
                setDetails(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching merchant details:', error);
                setLoading(false);
            }
        };
        fetchDetails();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setDetails(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await api.put('/merchant-details', details);
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error updating settings: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="admin-container">Loading...</div>;

    return (
        <div className="p-12 bg-background min-h-screen font-primary">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-secondary text-gray-800 garamond mb-2">Merchant Settings</h1>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-12 border-b border-secondary/10 pb-6">
                    Manage business profile and payment reception details
                </p>

                {message && (
                    <div className={`mb-8 p-4 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 ${message.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${message.includes('Error') ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* General Info */}
                    <div className="bg-white/40 backdrop-blur-md p-10 rounded-sm border border-secondary/5 shadow-sm">
                        <h3 className="text-2xl font-secondary text-gray-800 garamond mb-8 pb-4 border-b border-secondary/5 font-medium">Business Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Business Name</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={details.businessName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tax ID (PAN/VAT)</label>
                                <input
                                    type="text"
                                    name="taxId"
                                    value={details.taxId || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Email</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={details.contactEmail || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Phone</label>
                                <input
                                    type="text"
                                    name="contactPhone"
                                    value={details.contactPhone || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Business Address</label>
                                <textarea
                                    name="address"
                                    value={details.address || ''}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div className="bg-white/40 backdrop-blur-md p-10 rounded-sm border border-secondary/5 shadow-sm">
                        <div className="flex justify-between items-baseline mb-8 pb-4 border-b border-secondary/5">
                            <h3 className="text-2xl font-secondary text-gray-800 garamond font-medium">Bank Details</h3>
                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">For offline/manual payments</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Holder</label>
                                <input
                                    type="text"
                                    name="bankDetails.accountName"
                                    value={details.bankDetails?.accountName || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Number</label>
                                <input
                                    type="text"
                                    name="bankDetails.accountNumber"
                                    value={details.bankDetails?.accountNumber || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Name</label>
                                <input
                                    type="text"
                                    name="bankDetails.bankName"
                                    value={details.bankDetails?.bankName || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SWIFT Code</label>
                                <input
                                    type="text"
                                    name="bankDetails.swiftCode"
                                    value={details.bankDetails?.swiftCode || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IBAN</label>
                                <input
                                    type="text"
                                    name="bankDetails.iban"
                                    value={details.bankDetails?.iban || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-12">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-12 py-5 bg-secondary text-white rounded-sm font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-opacity-95 shadow-2xl shadow-secondary/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminMerchantSettings;
