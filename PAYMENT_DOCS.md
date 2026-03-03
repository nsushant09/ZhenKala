# Payment Integration Documentation

This document outlines how to set up the implemented payment methods for production.

## 1. Stripe (Visa, MasterCard, Amex, Apple Pay, Google Pay, UnionPay)

We use the [Stripe Payment Element](https://stripe.com/docs/payments/payment-element), which is a single UI component that handles multiple payment methods.

### Setup Instructions:
1.  **API Keys**: Go to your [Stripe Dashboard](https://dashboard.stripe.com/apikeys) and get your `Publishable key` and `Secret key`.
2.  **Digital Wallets**:
    *   **Apple Pay**: Go to [Apple Pay Settings](https://dashboard.stripe.com/settings/payments/apple_pay) in Stripe. Add your domain (`zhenkala.com`) and download the verification file. Upload it to your server at `/.well-known/apple-developer-merchantid-domain-association`.
    *   **Google Pay**: Enabled by default in the Stripe Dashboard under Payment Methods.
3.  **UnionPay**: Ensure "UnionPay" is enabled in your [Stripe Payment Methods](https://dashboard.stripe.com/settings/payments) settings.
4.  **Environment Variables**:
    *   `STRIPE_PUBLIC_KEY`: Use in frontend `client/src/config/payment.js`.
    *   `STRIPE_SECRET_KEY`: Use in backend `.env`.

---

## 2. PayPal

We use the [@paypal/react-paypal-js](https://www.npmjs.com/package/@paypal/react-paypal-js) SDK.

### Setup Instructions:
1.  **API Keys**: Go to the [PayPal Developer Portal](https://developer.paypal.com/dashboard/applications).
2.  Create an App (REST API) to get your `Client ID` and `Secret`.
3.  **Environment Variables**:
    *   `PAYPAL_CLIENT_ID`: Used for the frontend SDK.
    *   `PAYPAL_SECRET`: Used for backend captures.
    *   `PAYPAL_MODE`: Set to `sandbox` for testing or `live` for production.

---

## 3. Implementation Logic Files

-   **Backend Config**: `server/config/paymentConfig.js` - Stores all developer keys and business/bank details.
-   **Frontend Config**: `client/src/config/payment.js` - Stores public identifiers.
-   **Components**: 
    -   `client/src/components/payment/StripePaymentForm.jsx`: The card and wallet UI.
    -   `client/src/components/payment/PayPalPayment.jsx`: The PayPal button.
-   **Checkout Flow**: Located in `client/src/pages/CheckoutPage.jsx`. It follows a 2-step process (Shipping -> Payment Selection -> Finalize).

---

## 4. Recipient Bank Details
For wire transfers or direct payments where the payment gateway is bypassed, the business bank details are stored in `server/config/paymentConfig.js` under the `businessInfo` object. These are automatically pulled into the Invoice generation logic.
