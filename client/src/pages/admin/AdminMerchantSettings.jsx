import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
        <div className="admin-container">
            <div className="admin-header">
                <h1>Merchant Settings & Bank Details</h1>
                <p>Configure the details that appear on customer invoices and payment instructions.</p>
            </div>

            {message && (
                <div className={`message-banner ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="settings-form">
                <div className="settings-section">
                    <h3>General Business Info</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Business Name</label>
                            <input
                                type="text"
                                name="businessName"
                                value={details.businessName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Tax ID / PAN</label>
                            <input
                                type="text"
                                name="taxId"
                                value={details.taxId || ''}
                                onChange={handleChange}
                                placeholder="GSR/VAT/PAN number"
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Email</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={details.contactEmail || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Phone</label>
                            <input
                                type="text"
                                name="contactPhone"
                                value={details.contactPhone || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Business Address</label>
                            <textarea
                                name="address"
                                value={details.address || ''}
                                onChange={handleChange}
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Bank Transfer Details</h3>
                    <p className="section-hint">Used for Wire Transfer or Direct Bank Deposit instructions.</p>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Account Holder Name</label>
                            <input
                                type="text"
                                name="bankDetails.accountName"
                                value={details.bankDetails?.accountName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Account Number</label>
                            <input
                                type="text"
                                name="bankDetails.accountNumber"
                                value={details.bankDetails?.accountNumber || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Bank Name</label>
                            <input
                                type="text"
                                name="bankDetails.bankName"
                                value={details.bankDetails?.bankName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Branch Name</label>
                            <input
                                type="text"
                                name="bankDetails.branchName"
                                value={details.bankDetails?.branchName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>SWIFT / BIC Code</label>
                            <input
                                type="text"
                                name="bankDetails.swiftCode"
                                value={details.bankDetails?.swiftCode || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>IBAN</label>
                            <input
                                type="text"
                                name="bankDetails.iban"
                                value={details.bankDetails?.iban || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Electronic Payments</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>PayPal Business Email</label>
                            <input
                                type="email"
                                name="paypalEmail"
                                value={details.paypalEmail || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminMerchantSettings;
