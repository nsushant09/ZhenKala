import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

const CartSummary = () => {
    const { getCartTotal } = useCart();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();

    const subtotal = getCartTotal();
    const shippingThreshold = 100;
    const shippingCost = subtotal > 0 && subtotal < shippingThreshold ? 15 : 0;
    const total = subtotal + shippingCost;

    return (
        <div className="cart-summary-container lg:w-[420px] flex-shrink-0 animate-slide-in-right">
            <div className="bg-white/40 backdrop-blur-md p-10 rounded-2xl border border-white/60 shadow-xl sticky top-32">
                <h3 className="font-secondary text-3xl mb-8 text-gray-800 garamond border-b border-secondary/5 pb-4">Order Summary</h3>

                <div className="space-y-5 mb-8 pb-8 border-b border-secondary/5">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span>Subtotal</span>
                        <span className="text-gray-800">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span>Shipping</span>
                        <span>
                            {shippingCost > 0 ? formatPrice(shippingCost) : <span className="text-secondary">FREE</span>}
                        </span>
                    </div>

                    {shippingCost > 0 && (
                        <div className="bg-secondary/5 p-4 rounded-lg mt-2">
                            <p className="text-[10px] text-secondary font-bold uppercase tracking-wider text-center">
                                Add {formatPrice(shippingThreshold - subtotal)} more for FREE shipping
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between font-bold text-3xl mb-10 text-gray-800 items-baseline">
                    <span className="garamond text-xl">Total Due</span>
                    <span className="text-secondary">{formatPrice(total)}</span>
                </div>

                <button
                    onClick={() => navigate('/checkout')}
                    className="checkout-action-btn w-full bg-secondary text-white py-5 rounded-sm font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all shadow-lg hover:shadow-secondary/20 hover:-translate-y-1 active:scale-[0.98]"
                >
                    Proceed to Checkout <FiArrowRight />
                </button>

                <div className="trust-badges mt-8 flex flex-col items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center opacity-60">
                    <div className="flex items-center gap-2">
                        <span className="h-[1px] w-8 bg-gray-200"></span>
                        <span>Secure Checkout</span>
                        <span className="h-[1px] w-8 bg-gray-200"></span>
                    </div>
                    <p>Authentic Himalayan Art &nbsp; • &nbsp; ZhenKala</p>
                </div>
            </div>
        </div>
    );
};

export default CartSummary;
