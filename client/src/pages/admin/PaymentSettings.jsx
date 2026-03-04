import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiArrowLeft,
    FiSave,
    FiCreditCard,
    FiSettings,
    FiInfo,
    FiCheckCircle,
    FiShield,
    FiGlobe
} from 'react-icons/fi';
import api from '../../services/api';

const PaymentSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({
        stripe: { publicKey: '', secretKey: '', enabled: true },
        paypal: { clientId: '', secret: '', mode: 'sandbox', enabled: true },
        applePay: { merchantId: '', enabled: true },
        googlePay: { merchantId: '', merchantName: 'ZhenKala', enabled: true },
        businessInfo: {
            legalName: '',
            email: '',
            phone: '',
            address: '',
            bankName: '',
            accountName: '',
            accountNumber: '',
            swiftCode: ''
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/payment-settings');
            setSettings(data);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setError('Failed to load payment settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setError('');

        try {
            await api.put('/payment-settings', settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError(err.response?.data?.message || 'Failed to update settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-400">Loading settings...</div>;

    return (
        <div className="p-12 bg-background min-h-screen font-primary">
            <div className="max-w-6xl mx-auto">
                <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-widest mb-10 hover:opacity-70 transition-opacity"
                >
                    <FiArrowLeft /> Back to Sanctuary
                </Link>

                <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 border-b border-secondary/10 pb-8 gap-6">
                    <div>
                        <h1 className="text-5xl font-secondary text-gray-800 garamond italic mb-1">Gateway Portals</h1>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                            Managing the digital flow of prosperity and energy
                        </p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-3 bg-secondary text-white px-10 py-4 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-opacity-95 shadow-2xl shadow-secondary/10 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? 'Transmuting...' : <><FiSave /> Seal Gateways</>}
                    </button>
                </div>

                {success && (
                    <div className="mb-8 p-4 bg-green-50 text-green-600 border border-green-100 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                        <FiCheckCircle size={16} /> Configuration Manifested Successfully
                    </div>
                )}

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                        <FiInfo size={16} /> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Navigation/Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <a href="#stripe" className="flex items-center gap-4 p-5 bg-white/40 backdrop-blur-sm rounded-sm border border-secondary/5 hover:border-secondary/20 hover:bg-white transition-all group">
                            <FiCreditCard className="text-secondary opacity-50 group-hover:opacity-100" />
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-800 uppercase tracking-widest transition-colors">Stripe Terminal</span>
                        </a>
                        <a href="#paypal" className="flex items-center gap-4 p-5 bg-white/40 backdrop-blur-sm rounded-sm border border-secondary/5 hover:border-secondary/20 hover:bg-white transition-all group">
                            <FiGlobe className="text-secondary opacity-50 group-hover:opacity-100" />
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-800 uppercase tracking-widest transition-colors">PayPal Gateway</span>
                        </a>
                        <a href="#business" className="flex items-center gap-4 p-5 bg-white/40 backdrop-blur-sm rounded-sm border border-secondary/5 hover:border-secondary/20 hover:bg-white transition-all group">
                            <FiShield className="text-secondary opacity-50 group-hover:opacity-100" />
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-800 uppercase tracking-widest transition-colors">Entity Identity</span>
                        </a>

                        <div className="p-8 bg-secondary/5 rounded-sm border border-secondary/10 mt-12">
                            <h4 className="text-[10px] font-bold text-secondary mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <FiShield /> Security Protocol
                            </h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed italic">
                                Secret keys are sacred. Preserve them with care. The energy flow depends on your vigilance.
                            </p>
                        </div>
                    </div>

                    {/* Forms */}
                    <div className="lg:col-span-3 space-y-12">
                        {/* Stripe Section */}
                        <section id="stripe" className="bg-white/40 backdrop-blur-md p-10 rounded-sm border border-secondary/5 shadow-sm">
                            <div className="flex items-center justify-between mb-10 border-b border-secondary/5 pb-6">
                                <div className="flex items-center gap-4 text-gray-800">
                                    <h3 className="text-3xl font-secondary garamond italic">Stripe Manifestation</h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.stripe.enabled}
                                        onChange={(e) => handleInputChange('stripe', 'enabled', e.target.checked)}
                                    />
                                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                                </label>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Public Key (Publishable)</label>
                                    <input
                                        type="text"
                                        value={settings.stripe.publicKey}
                                        onChange={(e) => handleInputChange('stripe', 'publicKey', e.target.value)}
                                        placeholder="pk_test_..."
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm focus:outline-none focus:border-secondary transition-all text-sm font-mono text-gray-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secret Key (Private)</label>
                                    <input
                                        type="password"
                                        value={settings.stripe.secretKey}
                                        onChange={(e) => handleInputChange('stripe', 'secretKey', e.target.value)}
                                        placeholder="sk_test_..."
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm focus:outline-none focus:border-secondary transition-all text-sm font-mono text-gray-600"
                                    />
                                </div>
                                <div className="p-5 bg-secondary/[0.03] border border-secondary/5 rounded-sm text-[11px] text-gray-500 italic leading-relaxed">
                                    Enabling this portal allows the reception of world commerce: <strong>Visa, MasterCard, Amex, and Digital Wallets</strong>.
                                </div>
                            </div>
                        </section>

                        {/* PayPal Section */}
                        <section id="paypal" className="bg-white/40 backdrop-blur-md p-10 rounded-sm border border-secondary/5 shadow-sm">
                            <div className="flex items-center justify-between mb-10 border-b border-secondary/5 pb-6">
                                <h3 className="text-3xl font-secondary text-gray-800 garamond italic">PayPal Portal</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.paypal.enabled}
                                        onChange={(e) => handleInputChange('paypal', 'enabled', e.target.checked)}
                                    />
                                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                                </label>
                            </div>

                            <div className="space-y-8">
                                <div className="flex gap-4 p-1 bg-gray-100 rounded-sm">
                                    {['sandbox', 'live'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={(e) => { e.preventDefault(); handleInputChange('paypal', 'mode', mode); }}
                                            className={`flex-1 py-3 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${settings.paypal.mode === mode ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {mode} realm
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Portal ID (Client ID)</label>
                                    <input
                                        type="text"
                                        value={settings.paypal.clientId}
                                        onChange={(e) => handleInputChange('paypal', 'clientId', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm focus:outline-none focus:border-secondary transition-all text-sm font-mono text-gray-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secret Key</label>
                                    <input
                                        type="password"
                                        value={settings.paypal.secret}
                                        onChange={(e) => handleInputChange('paypal', 'secret', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm focus:outline-none focus:border-secondary transition-all text-sm font-mono text-gray-600"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Entity Info Section */}
                        <section id="business" className="bg-white/40 backdrop-blur-md p-10 rounded-sm border border-secondary/5 shadow-sm">
                            <div className="flex items-center gap-4 mb-10 border-b border-secondary/5 pb-6">
                                <h3 className="text-3xl font-secondary text-gray-800 garamond italic">Entity Identity</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legal Consciousness (Business Name)</label>
                                    <input
                                        type="text"
                                        value={settings.businessInfo.legalName}
                                        onChange={(e) => handleInputChange('businessInfo', 'legalName', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Public Correspondence (Email)</label>
                                    <input
                                        type="email"
                                        value={settings.businessInfo.email}
                                        onChange={(e) => handleInputChange('businessInfo', 'email', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-6">
                                    <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest border-l-2 border-secondary pl-4">Sacred Vault Reference (Manual Flow)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">The Sanctuary (Bank Name)</label>
                                            <input
                                                type="text"
                                                value={settings.businessInfo.bankName}
                                                onChange={(e) => handleInputChange('businessInfo', 'bankName', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identity Number (Account #)</label>
                                            <input
                                                type="text"
                                                value={settings.businessInfo.accountNumber}
                                                onChange={(e) => handleInputChange('businessInfo', 'accountNumber', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-secondary transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSettings;
