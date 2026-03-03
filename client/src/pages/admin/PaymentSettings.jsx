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
        <div className="p-6 bg-primary min-h-screen">
            <div className="max-w-5xl mx-auto">
                <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <FiArrowLeft /> Back to Dashboard
                </Link>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 garamond">Payment Gateway Configuration</h1>
                        <p className="text-gray-500 text-sm">Manage API keys and payment methods for your store</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : <><FiSave /> Save Changes</>}
                    </button>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl flex items-center gap-3">
                        <FiCheckCircle size={20} /> Settings saved successfully!
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl flex items-center gap-3">
                        <FiInfo size={20} /> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Navigation/Sidebar */}
                    <div className="md:col-span-1 space-y-2">
                        <a href="#stripe" className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                            <FiCreditCard className="text-blue-600" />
                            <span className="font-medium text-gray-700">Stripe (Cards/Digital)</span>
                        </a>
                        <a href="#paypal" className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                            <FiGlobe className="text-blue-400" />
                            <span className="font-medium text-gray-700">PayPal</span>
                        </a>
                        <a href="#business" className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                            <FiShield className="text-secondary" />
                            <span className="font-medium text-gray-700">Business & Bank Info</span>
                        </a>
                        <div className="p-4 bg-blue-50 rounded-xl mt-6 border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <FiInfo /> Security Note
                            </h4>
                            <p className="text-xs text-blue-600">
                                These keys are sensitive. Ensure you are using SSL and never share your Secret Keys.
                            </p>
                        </div>
                    </div>

                    {/* Forms */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Stripe Section */}
                        <section id="stripe" className="bg-white p-6 rounded-2xl shadow-xl border border-black/5">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600">
                                        <FiCreditCard size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Stripe Configuration</h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.stripe.enabled}
                                        onChange={(e) => handleInputChange('stripe', 'enabled', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Public Key (Publishable Key)</label>
                                    <input
                                        type="text"
                                        value={settings.stripe.publicKey}
                                        onChange={(e) => handleInputChange('stripe', 'publicKey', e.target.value)}
                                        placeholder="pk_test_..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Secret Key</label>
                                    <input
                                        type="password"
                                        value={settings.stripe.secretKey}
                                        onChange={(e) => handleInputChange('stripe', 'secretKey', e.target.value)}
                                        placeholder="sk_test_..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-mono"
                                    />
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                                    By enabling Stripe, you automatically support <strong>Visa, MasterCard, Amex, Apple Pay, Google Pay, Alipay, and WeChat Pay</strong>.
                                </div>
                            </div>
                        </section>

                        {/* Digital Wallets Extra Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-black/5">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" className="h-4" alt="Apple Pay" />
                                    Apple Pay
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Merchant Identifier</label>
                                        <input
                                            type="text"
                                            value={settings.applePay.merchantId}
                                            onChange={(e) => handleInputChange('applePay', 'merchantId', e.target.value)}
                                            placeholder="merchant.com.yourname"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-black/5">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" className="h-4" alt="Google Pay" />
                                    Google Pay
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Merchant ID</label>
                                        <input
                                            type="text"
                                            value={settings.googlePay.merchantId}
                                            onChange={(e) => handleInputChange('googlePay', 'merchantId', e.target.value)}
                                            placeholder="1234567890"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PayPal Section */}
                        <section id="paypal" className="bg-white p-6 rounded-2xl shadow-xl border border-black/5">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-400/10 rounded-full flex items-center justify-center text-blue-400">
                                        <FiGlobe size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">PayPal Configuration</h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.paypal.enabled}
                                        onChange={(e) => handleInputChange('paypal', 'enabled', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"></div>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4 mb-4">
                                    <button
                                        onClick={() => handleInputChange('paypal', 'mode', 'sandbox')}
                                        className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${settings.paypal.mode === 'sandbox' ? 'bg-blue-400 text-white border-blue-400' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                                    >
                                        SANDBOX
                                    </button>
                                    <button
                                        onClick={() => handleInputChange('paypal', 'mode', 'live')}
                                        className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${settings.paypal.mode === 'live' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                                    >
                                        LIVE
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Client ID</label>
                                    <input
                                        type="text"
                                        value={settings.paypal.clientId}
                                        onChange={(e) => handleInputChange('paypal', 'clientId', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Secret</label>
                                    <input
                                        type="password"
                                        value={settings.paypal.secret}
                                        onChange={(e) => handleInputChange('paypal', 'secret', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-sm font-mono"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Business Info Section */}
                        <section id="business" className="bg-white p-6 rounded-2xl shadow-xl border border-black/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                                    <FiShield size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Business & Bank Details</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Legal Business Name</label>
                                    <input
                                        type="text"
                                        value={settings.businessInfo.legalName}
                                        onChange={(e) => handleInputChange('businessInfo', 'legalName', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Public Support Email</label>
                                    <input
                                        type="email"
                                        value={settings.businessInfo.email}
                                        onChange={(e) => handleInputChange('businessInfo', 'email', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <h4 className="text-sm font-bold text-gray-900 my-4 border-b border-gray-50 pb-2">Wire Transfer Details (Manual)</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bank Name</label>
                                    <input
                                        type="text"
                                        value={settings.businessInfo.bankName}
                                        onChange={(e) => handleInputChange('businessInfo', 'bankName', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Number</label>
                                    <input
                                        type="text"
                                        value={settings.businessInfo.accountNumber}
                                        onChange={(e) => handleInputChange('businessInfo', 'accountNumber', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">SWIFT / BIC Code</label>
                                    <input
                                        type="text"
                                        value={settings.businessInfo.swiftCode}
                                        onChange={(e) => handleInputChange('businessInfo', 'swiftCode', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Holder Name</label>
                                    <input
                                        type="text"
                                        value={settings.businessInfo.accountName}
                                        onChange={(e) => handleInputChange('businessInfo', 'accountName', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                    />
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
