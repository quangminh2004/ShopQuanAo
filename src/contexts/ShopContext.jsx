import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CATEGORIES, INITIAL_PRODUCT_VARIANTS } from '../data/mockData';
import api from '../utils/api';

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const stored = localStorage.getItem('lunina_products');
    return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState(() => {
    const stored = localStorage.getItem('lunina_categories');
    return stored ? JSON.parse(stored) : INITIAL_CATEGORIES;
  });

  const [variants, setVariants] = useState(() => {
    const stored = localStorage.getItem('lunina_variants');
    return stored ? JSON.parse(stored) : INITIAL_PRODUCT_VARIANTS;
  });

  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem('lunina_orders');
    return stored ? JSON.parse(stored) : INITIAL_ORDERS;
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/product'),
          api.get('/categories?page=1&size=1000')
        ]);
        
        // Map backend product data to internal structure
        if (prodRes.data?.data) {
          const backendProducts = prodRes.data.data.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.basePrice || p.price || 0, // Fallback if API uses basePrice
            imageUrl: p.imageUrl,
            categoryId: p.category?.id || 1,
            stockQuantity: p.stockQuantity ?? 100, // mock stock if not returned
            sold: p.sold ?? 0,
            createdAt: new Date().toISOString()
          }));
          setProducts(backendProducts);
          localStorage.setItem('lunina_products', JSON.stringify(backendProducts));
        }

        if (catRes.data?.data) {
          setCategories(catRes.data.data);
          localStorage.setItem('lunina_categories', JSON.stringify(catRes.data.data));
        }

        // Variants lấy từ variants đã embedded sẵn trong list product (vì GET /product-variant không trả về productId)
        try {
          const allVariants = [];
          (prodRes.data.data || []).forEach(p => {
            if (Array.isArray(p.variants)) {
              p.variants.forEach(v => {
                allVariants.push({
                  id: v.id,
                  productId: p.id,       // Gán productId từ product cha
                  sizeName: v.sizeName,
                  colorName: v.colorName,
                  price: v.price || 0,
                  stock: v.stock || 0,
                  variantImageUrl: v.variantImageUrl,
                });
              });
            }
          });
          if (allVariants.length > 0) {
            setVariants(allVariants);
            localStorage.setItem('lunina_variants', JSON.stringify(allVariants));
          }
        } catch(e) { console.warn('Could not extract variants from products.', e); }

      } catch (err) {
        console.warn("Failed to fetch shop data from API, using local storage fallback", err);
      }
    };
    fetchInitialData();
  }, []);

  // ---- Persist helpers (Fallback updates) ----
  const persistProducts = (u) => { localStorage.setItem('lunina_products', JSON.stringify(u)); setProducts(u); };
  const persistCategories = (u) => { localStorage.setItem('lunina_categories', JSON.stringify(u)); setCategories(u); };
  const persistVariants = (u) => { localStorage.setItem('lunina_variants', JSON.stringify(u)); setVariants(u); };
  const persistOrders = (u) => { localStorage.setItem('lunina_orders', JSON.stringify(u)); setOrders(u); };

  // ---- Category CRUD ----
  // POST /categories: { name, description }
  // PUT /categories/{id}: { name, description }
  const addCategory = async (data) => {
    try {
      // Chỉ gửi đúng trường theo schema
      const payload = { name: data.name, description: data.description || '' };
      const res = await api.post('/categories', payload);
      if (res.data?.data) {
        const newCat = res.data.data; // { id, name, description }
        persistCategories([...categories, newCat]);
        return newCat;
      }
    } catch(err) { console.warn('API addCategory fail:', err); }
    // Fallback
    const newCat = { ...data, id: Date.now() };
    persistCategories([...categories, newCat]);
    return newCat;
  };

  const updateCategory = async (id, data) => {
    try {
      const payload = { name: data.name, description: data.description || '' };
      await api.put(`/categories/${id}`, payload);
    } catch(err) { console.warn('API updateCategory fail:', err); }
    persistCategories(categories.map((c) => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCategory = async (id) => {
    try { await api.delete(`/categories/${id}`); } catch(err) { console.warn('API deleteCategory fail:', err); }
    persistCategories(categories.filter((c) => c.id !== id));
  };
  const getCategoryName = (categoryId) => categories.find((c) => c.id === categoryId)?.name || '—';

  // ---- Product CRUD ----
  const addProduct = async (data) => {
    try {
      // Backend expects category to be an object usually, or just ID if mapped correctly. 
      // We pass the category nested object as per your schema.
      const payload = {
        name: data.name,
        description: data.description,
        basePrice: data.price,
        imageUrl: data.imageUrl,
        category: { id: data.categoryId }
      };
      const res = await api.post('/product', payload);
      if (res.data?.data) {
        const newProduct = { ...data, id: res.data.data.id, price: res.data.data.basePrice || payload.basePrice, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sold: 0 };
        persistProducts([...products, newProduct]);
        return newProduct;
      }
    } catch(err) { console.warn("API Add Product fail:", err); }

    // Fallback
    const newProduct = { ...data, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sold: 0 };
    persistProducts([...products, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id, data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        basePrice: data.price,
        imageUrl: data.imageUrl,
        category: { id: data.categoryId }
      };
      await api.put(`/product/${id}`, payload);
    } catch(err) {}
    persistProducts(products.map((p) => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
  };

  const deleteProduct = async (id) => {
    try { await api.delete(`/product/${id}`); } catch(err) {}
    persistProducts(products.filter((p) => p.id !== id));
    persistVariants(variants.filter((v) => v.productId !== id));
  };
  const getProduct = (id) => products.find((p) => p.id === parseInt(id));

  // ---- Variant CRUD ----
  const getVariantsByProduct = (productId) => variants.filter((v) => v.productId === parseInt(productId));
  const addVariant = async (data) => {
    try {
      // Backend chỉ cần: { sizeName, colorName, price, stock, variantImageUrl }
      const payload = {
        sizeName: data.sizeName,
        colorName: data.colorName,
        price: data.price,
        stock: data.stock,
        variantImageUrl: data.variantImageUrl || '',
      };
      const res = await api.post('/product-variant', payload);
      if (res.data?.data) {
        // Gán productId nội bộ để UI vẫn filter được
        const newV = { ...res.data.data, productId: data.productId };
        persistVariants([...variants, newV]);
        return newV;
      }
    } catch(err) { console.warn('API addVariant fail:', err); }
    // Fallback
    const newVariant = { ...data, id: Date.now() };
    persistVariants([...variants, newVariant]);
    return newVariant;
  };
  const updateVariant = async (id, data) => {
    try {
      // Backend chỉ cần: { sizeName, colorName, price, stock, variantImageUrl }
      const payload = {
        sizeName: data.sizeName,
        colorName: data.colorName,
        price: data.price,
        stock: data.stock,
        variantImageUrl: data.variantImageUrl || '',
      };
      await api.put(`/product-variant/${id}`, payload);
    } catch(err) { console.warn('API updateVariant fail:', err); }
    persistVariants(variants.map((v) => v.id === id ? { ...v, ...data } : v));
  };
  const deleteVariant = async (id) => {
    try { await api.delete(`/product-variant/${id}`); } catch(err) { console.warn('API deleteVariant fail:', err); }
    persistVariants(variants.filter((v) => v.id !== id));
  };
  const getVariant = (id) => variants.find((v) => v.id === id);

  // ---- Orders ----
  // POST /order → lấy orderId → POST /order-detail cho từng item
  const placeOrder = async ({ userId, deliveryAddress, items, totalAmount, discountApplied }) => {
    try {
      const orderDate = new Date().toISOString();
      // Bước 1: Tạo đơn hàng
      const orderRes = await api.post('/order', {
        orderDate,
        deliveryAddress,
        totalAmount,
        discountApplied,
      });

      if (orderRes.data?.data) {
        const createdOrder = orderRes.data.data;
        const orderId = createdOrder.id;

        // Bước 2: Tạo chi tiết đơn hàng cho từng item
        const detailResults = await Promise.allSettled(
          items.map((item) => {
            // POST /order-detail
            // Backend cần: { product: {id}, variant: {id} hoặc null, quantity, unitPrice }
            // Ta thêm order: {id} để liên kết (JWT backend sử dụng session hoặc query param)
            const detailPayload = {
              order: { id: orderId },
              product: { id: item.productId },
              ...(item.variantId ? { variant: { id: item.variantId } } : {}),
              quantity: item.quantity,
              unitPrice: item.unitPrice || item.price,
            };
            return api.post('/order-detail', detailPayload);
          })
        );

        // Lưu items nội bộ bất kể API thành công hay không
        const newO = {
          ...createdOrder,
          userId,
          status: createdOrder.status || 'DANG_DAT',
          items,
        };
        persistOrders([...orders, newO]);
        return newO;
      }
    } catch(err) {
      console.warn('API placeOrder fail:', err);
    }
    // Fallback nội bộ
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

  // PUT /order/{id}: { orderDate, deliveryAddress, totalAmount, discountApplied }
  const updateOrderStatus = async (orderId, status) => {
    const order = orders.find((o) => o.id === orderId);
    try {
      if (order) {
        await api.put(`/order/${orderId}`, {
          orderDate: order.orderDate || new Date().toISOString(),
          deliveryAddress: order.deliveryAddress || '',
          totalAmount: order.totalAmount || 0,
          discountApplied: order.discountApplied || 0,
        });
      }
    } catch(err) {
      console.warn('API updateOrder fail:', err);
    }
    persistOrders(orders.map((o) => o.id === orderId ? { ...o, status } : o));
  };

  // GET /order: lấy danh sách đơn hàng kèm items từ /order-detail
  const getUserOrders = async (userId) => {
    try {
      const res = await api.get('/order');
      if (res.data?.data) {
        // Fetch ORDER-DETAIL riêng để gắn items vào mỗi order
        let detailMap = {};
        try {
          const detailRes = await api.get('/order-detail');
          if (detailRes.data?.data) {
            // NHÓM order-details theo orderId (nếu có liên kết)
            detailRes.data.data.forEach(d => {
              const oid = d.orderId || d.order?.id;
              if (oid) {
                if (!detailMap[oid]) detailMap[oid] = [];
                // Map sang format nội bộ
                detailMap[oid].push({
                  id: d.id,
                  productId: d.product?.id,
                  variantId: d.variant?.id || null,
                  productName: d.product?.name,
                  sizeName: d.variant?.sizeName || null,
                  colorName: d.variant?.colorName || null,
                  quantity: d.quantity,
                  unitPrice: d.unitPrice,
                  imageUrl: d.variant?.variantImageUrl || d.product?.imageUrl,
                });
              }
            });
          }
        } catch(e) {
          console.warn('Could not fetch order-details:', e);
        }

        const apiOrders = res.data.data.map(o => ({
          id: o.id,
          userId,
          orderDate: o.orderDate,
          deliveryAddress: o.deliveryAddress,
          totalAmount: o.totalAmount,
          discountApplied: o.discountApplied,
          status: o.status || 'DANG_DAT',
          // Dùng items từ API nếu có, fallback về mảng rỗng
          items: detailMap[o.id] || [],
        }));
        persistOrders(apiOrders);
        return apiOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      }
    } catch(err) {
      console.warn('API getUserOrders fail, dùng local:', err);
    }
    // Fallback từ localStorage
    return orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  };

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
