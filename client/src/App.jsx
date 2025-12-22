import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Redux Imports
import { useDispatch } from "react-redux";
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
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import TrackOrderPage from "./pages/TrackOrderPage";

// Admin Pages
import UserListPage from "./pages/admin/UserListPage";
import UserEditPage from "./pages/admin/UserEditPage";
import OrderListPage from "./pages/admin/OrderListPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductListPage from "./pages/admin/ProductListPage";
import ProductEditPage from "./pages/admin/ProductEditPage";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import Dashboard from "./components/admin/Dashboard";
import CategoryManagementPage from "./pages/CategoryManagementPage";


// Components
import GuestPopup from "./components/guestpopup";
import Header from "./components/header";
import AppFooter from "./components/footer";
import AdminRoute from "./components/AdminRoute"; // ✅ Import the new wrapper

const App = () => {
  const dispatch = useDispatch();

  // ✅ MASTER INITIALIZATION
  useEffect(() => {
    dispatch(checkAuthStatus());
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <Router>
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
      
      <Header />
      <GuestPopup />

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
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
          
          {/* User Routes (You might want a separate <PrivateRoute> for these) */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/myorders" element={<OrderHistoryPage />} />
          
          {/* --- ADMIN ROUTES (PROTECTED) --- */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            
            {/* User Management */}
            <Route path="/admin/users" element={<UserListPage />} />
            <Route path="/admin/user/:id/edit" element={<UserEditPage />} />
            
            {/* Order Management */}
            <Route path="/admin/orders" element={<OrderListPage />} />
            
            {/* Product Management */}
            <Route path="/admin/products" element={<ProductListPage />} />
            <Route path="/admin/product/create" element={<ProductCreatePage />} />
            <Route path="/admin/product/:id/edit" element={<ProductEditPage />} />
            <Route path="/admin/categories" element={<CategoryManagementPage />} />
          </Route>

        </Routes>
      </main>
      
      <AppFooter />
    </Router>
  );
};

export default App;