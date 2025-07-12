import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  
  useEffect(() => {
    const savedCart = localStorage.getItem('prince_shipping_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (product, variant, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        item => item.product.id === product.id && item.variant.id === variant.id
      );
      
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.product.id === product.id && item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prevCart, { product, variant, quantity }];
      }
      
      localStorage.setItem('prince_shipping_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId, variantId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(
        item => !(item.product.id === productId && item.variant.id === variantId)
      );
      localStorage.setItem('prince_shipping_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (productId, variantId, quantity) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.product.id === productId && item.variant.id === variantId
          ? { ...item, quantity }
          : item
      );
      localStorage.setItem('prince_shipping_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('prince_shipping_cart');
  };

  const cartTotal = cart.reduce(
    (total, item) => {
    const price = item.variant?.product?.discount_price ?? item.variant?.product?.price ?? 0;
    return total + price * item.quantity;
    },
    0
    );

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);