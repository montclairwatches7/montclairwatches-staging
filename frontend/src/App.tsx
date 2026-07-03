import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import ScrollToTop from "@/components/ScrollToTop";
import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import SecurityPage from "./pages/SecurityPage";
import AddressesPage from "./pages/AddressesPage";
import FAQPage from "./pages/FAQPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import ContactPage from "./pages/ContactPage";
import ShippingPage from "./pages/ShippingPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import NotFound from "./pages/NotFound";
import AdminLayout from "./views/admin/AdminLayout";
import AdminProducts from "./views/admin/AdminProducts";
import AdminOrders from "./views/admin/AdminOrders";
import AdminUsers from "./views/admin/AdminUsers";
import AdminLogin from "./views/admin/AdminLogin";
import AdminDashboard from "./views/admin/AdminDashboard";
import AdminCategories from "./views/admin/AdminCategories";
import AdminCoupons from "./views/admin/AdminCoupons";
import AdminBanners from "./views/admin/AdminBanners";
import AdminBlogs from "./views/admin/AdminBlogs";
import AdminFAQ from "./views/admin/AdminFAQ";
import AdminTestimonials from "./views/admin/AdminTestimonials";
import AdminPages from "./views/admin/AdminPages";
import StoreLayout from "./components/StoreLayout";
import GuestRoute from "./components/GuestRoute";
import AdminSettings from "./pages/AdminSettings";
import AdminSupport from "./pages/AdminSupport";

const queryClient = new QueryClient();

import { AuthProvider } from "./context/AuthContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId="728282002663-q0qdrrcf0l2aqtkk36pk9ddsah3f2ue0.apps.googleusercontent.com">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <ScrollToTop />
            <Routes>
              <Route element={<StoreLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route element={<GuestRoute />}>
                  <Route path="/auth" element={<AuthPage />} />
                </Route>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route
                  path="/order-confirmation/:id"
                  element={<OrderConfirmationPage />}
                />
                <Route path="/order-history" element={<OrderHistoryPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/addresses" element={<AddressesPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/blogs" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route
                element={<GuestRoute redirectPath="/admin" adminOnly={true} />}
              >
                <Route path="/admin/login" element={<AdminLogin />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="blogs" element={<AdminBlogs />} />
                <Route path="faq" element={<AdminFAQ />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="pages" element={<AdminPages />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;
