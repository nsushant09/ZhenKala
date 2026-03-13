import React from 'react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCheckout } from '../../context/CheckoutContext';

const OrderSummary = () => {
    const { cart } = useCart();
    const { formatPrice } = useCurrency();
    const { totals, deliveryEstimate } = useCheckout();

    const formatSummaryPrice = (amount) => {
        // If the checkout totals are in a different currency (e.g. forced CNY/EUR for some methods)
        if (totals.currency !== totals.displayCurrency) { // Wait, I didn't add displayCurrency explicitly yet, let's stick to base for now or use the rate
            // Using simple format logic from original
        }

        // Use symbol from totals if available or format normally
        const symbol = totals.symbol || '';
        if (symbol) {
            return `${symbol} ${(amount * totals.rate).toFixed(2)}`;
        }

        return formatPrice(amount);
    };

    return (
        <div className="checkout-summary-card sticky-summary">
            <h2 className="section-title garamond">Order Summary</h2>

            <div className="cart-items-preview">
                {cart.items.map((item, idx) => (
                    <div key={idx} className="preview-item">
                        <div className="item-img">
                            <img src={item.product?.images?.[0]?.url || item.image || '/placeholder.jpg'} alt={item.product?.name} />
                            <span className="item-qty-badge">{item.quantity}</span>
                        </div>
                        <div className="item-details">
                            <p className="item-name">{item.product?.name || item.name}</p>
                            <p className="item-meta">
                                {item.size && <span>Size: {item.size}</span>}
                                {item.color && <span>Color: {item.color}</span>}
                            </p>
                        </div>
                        <div className="item-price">
                            {formatPrice((item.price || item.product?.price || 0) * item.quantity)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="summary-calculations">
                <div className="calc-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="calc-row">
                    <span>Shipping</span>
                    <span className={totals.shipping === 0 ? 'free-shipping' : ''}>
                        {totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
                    </span>
                </div>

                <div className="calc-row delivery-info">
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Est. Delivery
                    </span>
                    <span>
                        {deliveryEstimate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </span>
                </div>

                <div className="calc-row total mt-4 pt-4 border-t border-white/10">
                    <span>Total Amount</span>
                    <div className="text-right">
                        <span className="total-value">{formatPrice(totals.total)}</span>
                        {/* Show converted price if relevant (e.g. for regional methods) */}
                        {totals.rate !== 1 && (
                            <p className="converted-total-subtext">
                                Approx. {totals.symbol} {(totals.total * totals.rate).toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="secure-footer mt-6">
                <div className="flex items-center justify-center text-xs text-gray-400">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure SSL Encrypted Transaction
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
