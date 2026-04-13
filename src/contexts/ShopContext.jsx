import { createContext, useContext, useState } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CATEGORIES, INITIAL_PRODUCT_VARIANTS } from '../data/mockData';

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const stored = localStorage.getItem('lunina_products');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration: if old data without categoryId exists, overwrite with NEW initial data
      if (parsed.length > 0 && parsed[0].categoryId === undefined) {
        localStorage.setItem('lunina_products', JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return parsed;
    }
    localStorage.setItem('lunina_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState(() => {
    const stored = localStorage.getItem('lunina_categories');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('lunina_categories', JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  });

  const [variants, setVariants] = useState(() => {
    const stored = localStorage.getItem('lunina_variants');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('lunina_variants', JSON.stringify(INITIAL_PRODUCT_VARIANTS));
    return INITIAL_PRODUCT_VARIANTS;
  });

  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem('lunina_orders');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('lunina_orders', JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  });

  // ---- Persist helpers ----
  const persistProducts = (u) => { localStorage.setItem('lunina_products', JSON.stringify(u)); setProducts(u); };
  const persistCategories = (u) => { localStorage.setItem('lunina_categories', JSON.stringify(u)); setCategories(u); };
  const persistVariants = (u) => { localStorage.setItem('lunina_variants', JSON.stringify(u)); setVariants(u); };
  const persistOrders = (u) => { localStorage.setItem('lunina_orders', JSON.stringify(u)); setOrders(u); };

  // ---- Category CRUD ----
  const addCategory = (data) => {
    const newCat = { ...data, id: Date.now() };
    persistCategories([...categories, newCat]);
    return newCat;
  };
  const updateCategory = (id, data) => persistCategories(categories.map((c) => c.id === id ? { ...c, ...data } : c));
  const deleteCategory = (id) => persistCategories(categories.filter((c) => c.id !== id));
  const getCategoryName = (categoryId) => categories.find((c) => c.id === categoryId)?.name || '—';

  // ---- Product CRUD ----
  const addProduct = (data) => {
    const newProduct = { ...data, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sold: 0 };
    persistProducts([...products, newProduct]);
    return newProduct;
  };
  const updateProduct = (id, data) => {
    persistProducts(products.map((p) => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
  };
  const deleteProduct = (id) => {
    persistProducts(products.filter((p) => p.id !== id));
    persistVariants(variants.filter((v) => v.productId !== id));
  };
  const getProduct = (id) => products.find((p) => p.id === parseInt(id));

  // ---- Variant CRUD ----
  const getVariantsByProduct = (productId) => variants.filter((v) => v.productId === parseInt(productId));
  const addVariant = (data) => {
    const newVariant = { ...data, id: Date.now() };
    persistVariants([...variants, newVariant]);
    return newVariant;
  };
  const updateVariant = (id, data) => persistVariants(variants.map((v) => v.id === id ? { ...v, ...data } : v));
  const deleteVariant = (id) => persistVariants(variants.filter((v) => v.id !== id));
  const getVariant = (id) => variants.find((v) => v.id === id);

  // ---- Orders ----
  const placeOrder = ({ userId, deliveryAddress, items, totalAmount, discountApplied }) => {
    const newOrder = {
      id: Date.now(),
      userId,
      orderDate: new Date().toISOString(),
      deliveryAddress,
      totalAmount,
      discountApplied,
      status: 'DANG_DAT',
      items,
    };
    persistOrders([...orders, newOrder]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    persistOrders(orders.map((o) => o.id === orderId ? { ...o, status } : o));
  };

  const getUserOrders = (userId) =>
    orders.filter((o) => o.userId === userId).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  return (
    <ShopContext.Provider value={{
      // data
      products, categories, variants, orders,
      // category
      addCategory, updateCategory, deleteCategory, getCategoryName,
      // product
      addProduct, updateProduct, deleteProduct, getProduct,
      // variant
      getVariantsByProduct, addVariant, updateVariant, deleteVariant, getVariant,
      // orders
      placeOrder, updateOrderStatus, getUserOrders,
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
