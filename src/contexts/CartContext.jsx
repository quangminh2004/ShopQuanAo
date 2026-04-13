import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const getCartKey = (userId) => `lunina_cart_${userId}`;

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setCartItems([]);
      return;
    }
    
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart-item');
        if (res.data?.data) {
          // Backend mapping logic 
          // (Assuming backend returns mapped DTO structured similar to what we need)
          const mapped = res.data.data.map(item => ({
            id: item.id,
            itemKey: `${item.product?.id}_${item.variant?.id || null}`, // backend API schema calls it `variant`
            productId: item.product?.id || item.productId,
            variantId: item.variant?.id || item.variantId || null,
            name: item.product?.name || item.name,
            price: item.price !== undefined ? item.price : (item.variant?.price ?? item.product?.price ?? 0),
            imageUrl: item.variant?.variantImageUrl || item.imageUrl || item.product?.imageUrl,
            sizeName: item.variant?.sizeName || item.sizeName,
            colorName: item.variant?.colorName || item.colorName,
            quantity: item.quantity,
          }));
          setCartItems(mapped);
          localStorage.setItem(getCartKey(currentUser.id), JSON.stringify(mapped));
        } else {
          // Fallback to local
          const stored = localStorage.getItem(getCartKey(currentUser.id));
          setCartItems(stored ? JSON.parse(stored) : []);
        }
      } catch (err) {
        console.warn("API Cart fetch failed, using local storage:", err);
        const stored = localStorage.getItem(getCartKey(currentUser.id));
        setCartItems(stored ? JSON.parse(stored) : []);
      }
    };
    fetchCart();
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
  const addToCart = async (product, quantity = 1, variant = null) => {
    const variantId = variant?.id || null;
    const itemKey = `${product.id}_${variantId}`;
    const existing = cartItems.find((item) => item.itemKey === itemKey);

    let updated;
    const newItem = {
      id: Date.now(), // Fallback local ID
      itemKey,
      productId: product.id,
      variantId,
      name: product.name,
      price: variant?.price ?? product.price,
      imageUrl: variant?.variantImageUrl || product.imageUrl,
      sizeName: variant?.sizeName || null,
      colorName: variant?.colorName || null,
      quantity,
    };

    if (existing) {
      updated = cartItems.map((item) =>
        item.itemKey === itemKey ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [...cartItems, newItem];
    }
    persist(updated);

    // API Push
    try {
      const payload = {
        product: { id: product.id },
        ...(variantId ? { variant: { id: variantId } } : {}),
        quantity
      };
      await api.post('/cart-item', payload);
    } catch(err) { console.warn('API Add Cart fail:', err); }
  };

  const removeFromCart = async (itemKey) => {
    const itemToDelete = cartItems.find((i) => i.itemKey === itemKey);
    persist(cartItems.filter((item) => item.itemKey !== itemKey));

    if (itemToDelete) {
      try { await api.delete(`/cart-item/${itemToDelete.id}`); } catch(err) {} 
    }
  };

  const updateQuantity = async (itemKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    const itemToUpdate = cartItems.find((i) => i.itemKey === itemKey);
    persist(cartItems.map((item) => item.itemKey === itemKey ? { ...item, quantity } : item));

    if (itemToUpdate) {
      try {
        // PUT backend require schema: product, variant, quantity
        const payload = {
          product: { id: itemToUpdate.productId },
          ...(itemToUpdate.variantId ? { variant: { id: itemToUpdate.variantId } } : {}),
          quantity
        };
        await api.put(`/cart-item/${itemToUpdate.id}`, payload);
      } catch(err) { console.warn('API Update Cart fail:', err); }
    }
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
