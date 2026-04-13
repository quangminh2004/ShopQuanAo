import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const getCartKey = (userId) => `lunina_cart_${userId}`;

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const stored = localStorage.getItem(getCartKey(currentUser.id));
      setCartItems(stored ? JSON.parse(stored) : []);
    } else {
      setCartItems([]);
    }
  }, [currentUser]);

  const persist = (items) => {
    if (currentUser) {
      localStorage.setItem(getCartKey(currentUser.id), JSON.stringify(items));
    }
    setCartItems(items);
  };

  /**
   * addToCart now accepts a variant object (optional).
   * Cart item key = productId + variantId (so same product with different variants are separate cart items)
   */
  const addToCart = (product, quantity = 1, variant = null) => {
    const variantId = variant?.id || null;
    const itemKey = `${product.id}_${variantId}`;
    const existing = cartItems.find((item) => item.itemKey === itemKey);

    let updated;
    if (existing) {
      updated = cartItems.map((item) =>
        item.itemKey === itemKey ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [
        ...cartItems,
        {
          id: Date.now(),
          itemKey,
          productId: product.id,
          variantId,
          name: product.name,
          // price: use variant price if available, else product price
          price: variant?.price ?? product.price,
          imageUrl: variant?.variantImageUrl || product.imageUrl,
          sizeName: variant?.sizeName || null,
          colorName: variant?.colorName || null,
          quantity,
        },
      ];
    }
    persist(updated);
  };

  const removeFromCart = (itemKey) => {
    persist(cartItems.filter((item) => item.itemKey !== itemKey));
  };

  const updateQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    persist(cartItems.map((item) => item.itemKey === itemKey ? { ...item, quantity } : item));
  };

  const clearCart = () => persist([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
