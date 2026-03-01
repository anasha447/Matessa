import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"; // ✅ Added useLocation
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { checkAuthStatus } from "./redux/slices/authSlice";
import { fetchCart } from "./redux/slices/cartSlice";

// Pages
import Home from "./pages/home";
import ConsumptionMap from "./pages/what.is.mate";
import StoryPage from "./pages/our_story";
import ShopPage from "./pages/shop";
import CartPage from "./pages/CartPage";
import SingleProductPage from "./pages/single-product-page";
import CheckoutPage from "./pages/checkoutpage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import OrderPage from "./pages/OrderPage"; 
import OrderHistoryPage from "./pages/OrderHistoryPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage"; 
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import TrackOrderPage from "./pages/TrackOrderPage";

// Admin Pages
import UserListPage from "./pages/admin/UserListPage";
import UserEditPage from "./pages/admin/UserEditPage";
import OrderManagementPage from "./pages/admin/OrderListPage"; 
import SingleOrderPage from "./pages/admin/SingleOrderPage"; 
import Dashboard from "./components/admin/Dashboard";
import ProductListPage from "./pages/admin/ProductListPage";
import ProductEditPage from "./pages/admin/ProductEditPage";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import ContactPage from "./pages/ContactUsPage";
import AdminInbox from "./pages/admin/AdminInbox";
import SubscriberList from "./pages/admin/SubscriberList";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminCartsPage from "./pages/admin/adminCartspage";


// Components
import GuestPopup from "./components/guestpopup";
import Header from "./components/header";
import AppFooter from "./components/footer";
import AdminRoute from "./components/AdminRoute"; 
import ScrollToTop from "./components/ScrollToTop"; 

// ✅ NEW: Helper Component to Track Page Views
// We need this separate component because 'useLocation' only works INSIDE <Router>
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location]); // Runs every time URL changes

  return null; // It renders nothing visually
};

const App = () => {
  const dispatch = useDispatch();
  
  // ✅ 1. Get the loading/checking state from Redux
  const { isCheckingAuth } = useSelector((state) => state.auth); 

  useEffect(() => {
    dispatch(checkAuthStatus());
    dispatch(fetchCart());
  }, [dispatch]);

  // ✅ 2. THE GATEKEEPER
  if (isCheckingAuth) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[var(--color-craemy)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[var(--color-darkgreen)]"></div>
        </div>
      );
  }

  return (
    <Router>
      {/* ✅ 3. Activate Analytics inside the Router */}
      <AnalyticsTracker />
      
      <Header />
      <ScrollToTop />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      

      <main className="min-h-screen bg-white">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/what.is.mate" element={<ConsumptionMap />} />
          <Route path="/our_story" element={<StoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/product/:id" element={<SingleProductPage />} />
          <Route path="/checkoutpage" element={<CheckoutPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} /> 
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
          
          {/* User Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/order/:id" element={<OrderPage />} /> 
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/myorders" element={<OrderHistoryPage />} />
          
          {/* --- ADMIN ROUTES (PROTECTED) --- */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/users" element={<UserListPage />} />
            <Route path="/admin/user/:id/edit" element={<UserEditPage />} />
            <Route path="/admin/orders" element={<OrderManagementPage />} />
            <Route path="/admin/order/:id" element={<SingleOrderPage />} />
            <Route path="/admin/products" element={<ProductListPage />} />
            <Route path="/admin/product/create" element={<ProductCreatePage />} />
            <Route path="/admin/product/:id/edit" element={<ProductEditPage />} />
            <Route path="/admin/categories" element={<CategoryManagementPage />} />
            <Route path="/admin/AdminInbox" element={<AdminInbox />} />
            <Route path="/admin/subscribers" element={<SubscriberList />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/carts" element={<AdminCartsPage />} />
          </Route>

        </Routes>
        
      </main>
      <GuestPopup />
      <AppFooter />
    </Router>
  );
};

export default App;