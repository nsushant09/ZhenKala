import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import ShippingForm from '../components/checkout/ShippingForm';
import PaymentSelector from '../components/checkout/PaymentSelector';
import OrderSummary from '../components/checkout/OrderSummary';
import PaymentInterface from '../components/checkout/PaymentInterface';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const {
    step,
    setStep,
    error,
    setError,
    resetCheckout
  } = useCheckout();

  useEffect(() => {
    // Validation: Redirect if cart is empty and not in middle of a process
    if (cart.items.length === 0 && step === 1) {
      navigate('/cart');
    }

    // Handle Resume Order logic from URL if needed
    const queryParams = new URLSearchParams(location.search);
    const resumeOrderId = queryParams.get('orderId');
    if (resumeOrderId) {
      // Context could handle this, but for now we keep the UI flow
      setStep(2);
    }

    return () => {
      // Optional: reset checkout state on unmount if it's not a success redirect
      if (!window.location.pathname.includes('order-success')) {
        // resetCheckout(); 
      }
    };
  }, [cart.items.length, step, navigate, location.search, setStep]);

  return (
    <div className="checkout-page-root">
      <div className="checkout-container max-w-7xl mx-auto px-4 py-12">

        {/* Error Banner */}
        {error && (
          <div className="checkout-error-banner animate-slide-down">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-white/50 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="checkout-grid flex flex-col lg:flex-row gap-12">
          {/* Main Content Side */}
          <div className="checkout-main w-full lg:w-2/3">
            <div className="checkout-stepper mb-10">
              <div className={`step-node ${step >= 1 ? 'active' : ''}`}>
                <span className="step-num">1</span>
                <span className="step-label">Shipping</span>
              </div>
              <div className="step-divider"></div>
              <div className={`step-node ${step >= 2 ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span className="step-label">Payment</span>
              </div>
            </div>

            {step === 1 ? (
              <ShippingForm />
            ) : (
              <div className="payment-phase-container">
                <PaymentSelector />
                <PaymentInterface />
                <button
                  onClick={() => setStep(1)}
                  className="back-to-shipping-btn mt-6 flex items-center text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Shipping Details
                </button>
              </div>
            )}
          </div>

          {/* Summary Side */}
          <div className="checkout-sidebar w-full lg:w-1/3">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;