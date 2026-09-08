import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import { PageLoader } from "@/components/loading";
import HomePage from "./pages/HomePage";
import StoreLayout from "./components/StoreLayout";
import GuestRoute from "./components/GuestRoute";
import { AuthProvider } from "./context/AuthContext";

const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const AddressesPage = lazy(() => import("./pages/AddressesPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ShippingPage = lazy(() => import("./pages/ShippingPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLayout = lazy(() => import("./views/admin/AdminLayout"));
const AdminProducts = lazy(() => import("./views/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./views/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./views/admin/AdminUsers"));
const AdminLogin = lazy(() => import("./views/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./views/admin/AdminDashboard"));
const AdminCategories = lazy(() => import("./views/admin/AdminCategories"));
const AdminCoupons = lazy(() => import("./views/admin/AdminCoupons"));
const AdminBanners = lazy(() => import("./views/admin/AdminBanners"));
const AdminBlogs = lazy(() => import("./views/admin/AdminBlogs"));
const AdminFAQ = lazy(() => import("./views/admin/AdminFAQ"));
const AdminTestimonials = lazy(() => import("./views/admin/AdminTestimonials"));
const AdminPages = lazy(() => import("./views/admin/AdminPages"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <ScrollToTop />
            <Suspense fallback={<PageLoader fullScreen />}>
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;
