import React from 'react';
import { useCheckout } from '../../context/CheckoutContext';

const ShippingForm = () => {
    const { shippingAddress, updateAddress, createOrder, loading } = useCheckout();

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateAddress({ [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createOrder();
        } catch (err) {
            // Error is handled in context
        }
    };

    return (
        <div className="shipping-form-container animate-fade-in">
            <h2 className="section-title garamond">Shipping Details</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
                <div className="form-group full-width">
                    <label>Street Address</label>
                    <input
                        type="text"
                        name="street"
                        value={shippingAddress.street}
                        onChange={handleChange}
                        placeholder="123 Silk Road"
                        required
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            name="city"
                            value={shippingAddress.city}
                            onChange={handleChange}
                            placeholder="Kathmandu"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>State / Province</label>
                        <input
                            type="text"
                            name="state"
                            value={shippingAddress.state}
                            onChange={handleChange}
                            placeholder="Bagmati"
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Country</label>
                        <input
                            type="text"
                            name="country"
                            value={shippingAddress.country}
                            onChange={handleChange}
                            placeholder="Nepal"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Zip / Postcode</label>
                        <input
                            type="text"
                            name="zipCode"
                            value={shippingAddress.zipCode}
                            onChange={handleChange}
                            placeholder="44600"
                            required
                        />
                    </div>
                </div>
                <div className="form-group full-width">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleChange}
                        placeholder="+977-..."
                        required
                    />
                </div>
                <button type="submit" className="place-order-btn mt-6" disabled={loading}>
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Initializing...
                        </span>
                    ) : 'Continue to Payment'}
                </button>
            </form>
        </div>
    );
};

export default ShippingForm;
