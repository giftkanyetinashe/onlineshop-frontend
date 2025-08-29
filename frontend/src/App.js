import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import PaymentStatusPage from './pages/PaymentStatusPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/admin/Dashboard';

import AdminOrders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';

import BannerManager from './pages/admin/BannerManager';
import TestPage from './pages/TestPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import OrderHistoryPage from './pages/OrderHistoryPage';
import theme from './theme';

import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminProductDetail2 from './pages/admin/AdminProductDetail';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReports from './pages/admin/AdminReports';


import OrderConfirmationPage from './pages/OrderConfirmationPage'; 


import { Box } from '@mui/material';



import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID="AST9NFYeTjqE7MvAbqwm6FWrKLf9vwYiuGbZSC3sWnku6ePotcT6HnIUzMXjwFfHJ_3VG7aFwlVbhaZj"; // Use an environment variable for this in a real app

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD" }}>
            <Router>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <Box sx={{ flexGrow: 1 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected routes */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/payment-status" element={<PaymentStatusPage />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/profile/orders" element={<OrderHistoryPage />} />
                      <Route path="/profile/orders/:orderId" element={<OrderDetail />} />
                      <Route path="/profile/orders/:orderId/:status" element={<OrderDetail />} />
                      <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                    </Route>
                    
                    {/* Admin routes */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      {/* <Route path="/admin/products" element={<AdminProducts />} /> */}
                      <Route path="/admin/orders" element={<AdminOrders />}>
                        {/*<Route path=":orderId" element={<OrderDetail />} />*/}
                      </Route>
                      <Route path="/admin/customers" element={<AdminCustomers />} />
                      {/* <Route path="/admin/products/:slug" element={<AdminProductDetail />} /> */}
                      <Route path="/admin/banner" element={<BannerManager />} />


                      <Route path="/admin/products" element={<AdminProductsPage />} />
                      <Route path="/admin/products/:slug" element={<AdminProductDetail2 />} />
                      <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                      <Route path="/admin/reports" element={<AdminReports />} />
                  
                    </Route>
                    <Route path="/test" element={<TestPage />} />
                  </Routes>
                </Box>
                <Footer />
              </Box>
            </Router>
          </PayPalScriptProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
