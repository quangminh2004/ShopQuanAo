import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ShopProvider } from './contexts/ShopContext';

import ProtectedRoute from './components/common/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Shop
import Home from './pages/shop/Home';
import ProductDetail from './pages/shop/ProductDetail';
import Checkout from './pages/shop/Checkout';
import OrderHistory from './pages/shop/OrderHistory';

// User
import Profile from './pages/user/Profile';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Shop (public) */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Home />} />
              <Route path="/products/:id" element={<ProductDetail />} />

              {/* Protected USER routes */}
              <Route path="/checkout" element={
                <ProtectedRoute><Checkout /></ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute><OrderHistory /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute requiredRole="ADMIN"><AdminProducts /></ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute requiredRole="ADMIN"><AdminCategories /></ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute requiredRole="ADMIN"><AdminOrders /></ProtectedRoute>
              } />
              <Route path="/admin/customers" element={
                <ProtectedRoute requiredRole="ADMIN"><AdminCustomers /></ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
            />
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
