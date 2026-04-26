import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Providers
import { AuthProvider } from '@/app/providers/AuthContext';
import { CartProvider } from '@/app/providers/CartContext';
import { ShopProvider } from '@/app/providers/ShopContext';
import { CurrencyProvider } from '@/app/providers/CurrencyContext';
import { MerchantProvider } from '@/app/providers/MerchantContext';

// Components
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PrivateRoute from '@/components/PrivateRoute';
import AdminRoute from '@/components/AdminRoute';
import ScrollToTop from '@/components/ScrollToTop';

// Hooks
import useScrollReveal from '@/hooks/useScrollReveal';

// Lazy load Pages
const HomePage = lazy(() => import('@/modules/home'));
const ProductsPage = lazy(() => import('@/modules/products'));
const ReviewsPage = lazy(() => import('@/modules/reviews'));
const ProductDetailPage = lazy(() => import('@/modules/productdetail'));
const CartPage = lazy(() => import('@/modules/cart'));
const CheckoutPage = lazy(() => import('@/modules/checkout'));
const LoginPage = lazy(() => import('@/modules/login'));
const RegisterPage = lazy(() => import('@/modules/register'));
const ProfilePage = lazy(() => import('@/modules/profile'));
const OrdersPage = lazy(() => import('@/modules/orders'));
const OrderDetailPage = lazy(() => import('@/modules/orderdetail'));
const AboutPage = lazy(() => import('@/modules/about'));
const ContactPage = lazy(() => import('@/modules/contact'));
const FAQPage = lazy(() => import('@/modules/faq'));
const DeliveryPage = lazy(() => import('@/modules/delivery'));
const PrivacyPolicyPage = lazy(() => import('@/modules/privacypolicy'));
const RefundPolicyPage = lazy(() => import('@/modules/refundpolicy'));
const OrderSuccessPage = lazy(() => import('@/modules/ordersuccess'));
const NotFoundPage = lazy(() => import('@/modules/notfound'));

// Admin Pages
const AdminDashboard = lazy(() => import('@/modules/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('@/modules/admin/AdminProducts'));
const AdminOrders = lazy(() => import('@/modules/admin/AdminOrders'));
const AdminUsers = lazy(() => import('@/modules/admin/AdminUsers'));
const AdminProductForm = lazy(() => import('@/modules/admin/AdminProductForm'));
const AdminMerchantSettings = lazy(() => import('@/modules/admin/AdminMerchantSettings'));
const PaymentSettings = lazy(() => import('@/modules/admin/PaymentSettings'));
const AdminAnalytics = lazy(() => import('@/modules/admin/AdminAnalytics'));
const AdminCoupons = lazy(() => import('@/modules/admin/AdminCoupons'));
const AdminMiscellaneous = lazy(() => import('@/modules/admin/AdminMiscellaneous'));

function ScrollRevealHandler() {
  useScrollReveal();
  return null;
}

const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

export function AppRouter() {
  return (
    <Router>
      <ScrollToTop />
      <ScrollRevealHandler />
      <AuthProvider>
        <CurrencyProvider>
          <MerchantProvider>
            <CartProvider>
              <ShopProvider>
                <div className="App">
                  <Navbar />
                  <main style={{ minHeight: 'calc(100vh - 282px)' }}>
                    <Suspense fallback={<LoadingScreen />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/reviews" element={<ReviewsPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/delivery" element={<DeliveryPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="/refund-policy" element={<RefundPolicyPage />} />

                        {/* Protected Routes */}
                        <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
                        <Route path="/order-success" element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                        <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
                        <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                        <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
                        <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
                        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                        <Route path="/admin/settings" element={<AdminRoute><AdminMerchantSettings /></AdminRoute>} />
                        <Route path="/admin/payment" element={<AdminRoute><PaymentSettings /></AdminRoute>} />
                        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
                        <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
                        <Route path="/admin/miscellaneous" element={<AdminRoute><AdminMiscellaneous /></AdminRoute>} />

                        {/* 404 Route */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>
              </ShopProvider>
            </CartProvider>
          </MerchantProvider>
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default AppRouter;
