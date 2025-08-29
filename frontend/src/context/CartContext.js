// src/context/CartContext.js

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api'; // Import api instance

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  // --- NEW: State for promo code logic ---
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isPromoLoading, setIsPromoLoading] = useState(false);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('prince_shipping_cart'));
      if (Array.isArray(savedCart)) setCart(savedCart);
      
      // Also load a saved promo code if it exists in session storage
      const savedPromo = JSON.parse(sessionStorage.getItem('prince_promo_code'));
      if(savedPromo) setAppliedPromo(savedPromo);

    } catch (error) {
      console.error("Failed to parse cart from storage", error);
      setCart([]);
    }
  }, []);
  
  const addToCart = (product, variant, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product?.id === product.id && item.variant?.id === variant.id);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item => item.product?.id === product.id && item.variant?.id === variant.id ? { ...item, quantity: item.quantity + quantity } : item);
      } else {
        newCart = [...prevCart, { product, variant, quantity }];
      }
      localStorage.setItem('prince_shipping_cart', JSON.stringify(newCart));
      showCartNotification(`${product.name} added to cart`);
      return newCart;
    });
  };

  const removeFromCart = (productId, variantId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => !(item.product?.id === productId && item.variant?.id === variantId));
      localStorage.setItem('prince_shipping_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (productId, variantId, quantity) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item => item.product?.id === productId && item.variant?.id === variantId ? { ...item, quantity } : item);
      localStorage.setItem('prince_shipping_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null); // Also clear the promo code
    localStorage.removeItem('prince_shipping_cart');
    sessionStorage.removeItem('prince_promo_code');
  };

  // --- NEW: All pricing logic is now centralized in the context ---
  const { originalSubtotal, saleSubtotal, totalProductSavings } = useMemo(() => {
    const totals = cart.reduce((acc, item) => {
      if (!item.product || !item.variant) return acc;
      const quantity = item.quantity;
      const originalPrice = Number(item.variant.price) || Number(item.product.price) || 0;
      const finalPrice = Number(item.variant.discount_price) || originalPrice;
      acc.originalSubtotal += originalPrice * quantity;
      acc.saleSubtotal += finalPrice * quantity;
      return acc;
    }, { originalSubtotal: 0, saleSubtotal: 0 });
    return {
      originalSubtotal: totals.originalSubtotal,
      saleSubtotal: totals.saleSubtotal,
      totalProductSavings: totals.originalSubtotal - totals.saleSubtotal
    };
  }, [cart]);

  const promoDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    let calculatedDiscount = 0;
    const value = parseFloat(appliedPromo.value);
    if (isNaN(value)) return 0;

    if (appliedPromo.discount_type === 'PERCENT') {
      calculatedDiscount = saleSubtotal * (value / 100);
    } else if (appliedPromo.discount_type === 'FIXED') {
      calculatedDiscount = value;
    }
    return Math.min(calculatedDiscount, saleSubtotal);
  }, [appliedPromo, saleSubtotal]);

  const finalTotal = saleSubtotal - promoDiscount;

  const handleApplyPromo = async () => {
    setPromoError('');
    setIsPromoLoading(true);
    setAppliedPromo(null);
    try {
      const response = await api.post('/orders/validate-promo/', {
        code: promoCode,
        cart_total: saleSubtotal
      });
      setAppliedPromo(response.data);
      // Use sessionStorage to persist promo code across page reloads for the current session
      sessionStorage.setItem('prince_promo_code', JSON.stringify(response.data));
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Invalid promotional code.';
      setPromoError(errorMessage);
      setAppliedPromo(null);
      sessionStorage.removeItem('prince_promo_code');
    } finally {
      setIsPromoLoading(false);
    }
  };
  
  const removePromo = () => {
      setAppliedPromo(null);
      setPromoCode('');
      setPromoError('');
      sessionStorage.removeItem('prince_promo_code');
  }

  const itemCount = cart.reduce((count, item) => count + (item.quantity || 0), 0);
  const [notification, setNotification] = useState(null);
  const showCartNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        // Provide all pricing and promo logic to the whole app
        originalSubtotal,
        saleSubtotal,
        totalProductSavings,
        promoDiscount,
        finalTotal,
        promoCode,
        setPromoCode,
        appliedPromo,
        promoError,
        isPromoLoading,
        handleApplyPromo,
        removePromo,
        showCartNotification,
        notification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext)