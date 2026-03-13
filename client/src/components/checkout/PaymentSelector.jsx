import React from 'react';
import { useCheckout } from '../../context/CheckoutContext';

const PaymentIcons = {
    'Apple Pay': 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg',
    'Google Pay': 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
    'MasterCard': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
    'Visa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg/640px-Visa_Inc._logo_%282021%E2%80%93present%29.svg.png',
    'PayPal': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
    'Union Pay': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg',
    'American Express': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
    'Alipay': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/dd/Alipay_logo_%282024%29.svg/960px-Alipay_logo_%282024%29.svg.png?_=20240609043243',
    'WeChat Pay': 'https://brandlogos.net/wp-content/uploads/2023/09/wechat_pay-logo_brandlogos.net_3mmfw-512x152.png'
};

const PaymentSelector = () => {
    const { paymentMethod, setPaymentMethod } = useCheckout();

    const categories = [
        {
            title: 'Credit / Debit Cards',
            methods: ['Visa', 'MasterCard', 'American Express', 'Union Pay']
        },
        {
            title: 'Digital Wallets',
            methods: ['PayPal']
        },
        {
            title: 'Regional Methods',
            methods: ['Alipay', 'WeChat Pay']
        }
    ];

    return (
        <div className="payment-selector-container animate-fade-in">
            <h2 className="section-title garamond">Payment Method</h2>
            <div className="payment-categories space-y-8">
                {categories.map((cat) => (
                    <div key={cat.title} className="payment-category">
                        <h4 className="category-label">{cat.title}</h4>
                        <div className="payment-options-grid">
                            {cat.methods.map((method) => (
                                <label
                                    key={method}
                                    className={`payment-card ${paymentMethod === method ? 'active' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method}
                                        checked={paymentMethod === method}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className="payment-info">
                                        <img src={PaymentIcons[method]} alt={method} className="method-logo" />
                                        <span className="method-name">{method}</span>
                                    </div>
                                    {paymentMethod === method && (
                                        <div className="selected-badge">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentSelector;
