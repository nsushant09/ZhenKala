import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCurrency } from '../../context/CurrencyContext';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    if (!item) return null;
    const { formatPrice } = useCurrency();
    const product = item.product || {};
    const price = item.price || product.price || 0;
    const itemTotal = price * item.quantity;
    const itemId = item._id;

    return (
        <div className="cart-item-row py-10 grid grid-cols-1 sm:grid-cols-12 gap-8 items-center group px-4 hover:bg-white/10 transition-colors animate-fade-in">
            {/* Product Info */}
            <div className="col-span-1 sm:col-span-6 flex gap-8">
                <Link to={`/products/${product._id}`} className="cart-item-image-container w-28 h-36 flex-shrink-0 bg-white p-2 rounded-sm shadow-sm relative border border-gray-100 overflow-hidden">
                    <img
                        src={product.images && product.images[0]?.url ? product.images[0].url : '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </Link>
                <div className="flex flex-col justify-center py-1">
                    <div>
                        <Link to={`/products/${product._id}`} className="font-secondary text-2xl text-gray-800 hover:text-secondary transition-colors block mb-1 garamond">
                            {product.name}
                        </Link>
                        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider space-y-1 mb-4 flex gap-4">
                            {item.size && <div className="flex items-center gap-1">Size: <span className="text-gray-600">{item.size}</span></div>}
                            {item.color && <div className="flex items-center gap-1">Color: <span className="text-gray-600">{item.color}</span></div>}
                        </div>
                    </div>
                    <button
                        onClick={() => onRemove(itemId)}
                        className="text-gray-400 hover:text-secondary transition-colors duration-300 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider w-fit group/remove"
                    >
                        <FiTrash2 size={12} className="group-hover/remove:text-secondary" /> Remove Item
                    </button>
                </div>
            </div>

            {/* Price (Desktop) */}
            <div className="col-span-1 sm:col-span-2 sm:text-center text-sm font-medium text-gray-500 hidden sm:block">
                {formatPrice(price)}
            </div>

            {/* Quantity Controls */}
            <div className="col-span-1 sm:col-span-2 flex sm:justify-center">
                <div className="quantity-stepper flex items-center border border-gray-200 rounded-full bg-white p-1">
                    <button
                        onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-secondary disabled:opacity-30 transition-colors"
                    >
                        <FiMinus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-secondary transition-colors"
                    >
                        <FiPlus size={12} />
                    </button>
                </div>
            </div>

            {/* Total Price */}
            <div className="col-span-1 sm:col-span-2 sm:text-right font-bold text-lg text-secondary flex items-center justify-between sm:block">
                <span className="sm:hidden text-xs text-gray-400 uppercase tracking-widest font-bold">Total:</span>
                {formatPrice(itemTotal)}
            </div>
        </div>
    );
};

export default CartItem;
