import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  // Khởi tạo rỗng — dữ liệu thật luôn từ API
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Luôn lấy từ API, không dùng mock
  const [variants, setVariants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingShop, setLoadingShop] = useState(true);

  // Xóa stale localStorage khi khởi động
  useEffect(() => {
    localStorage.removeItem('lunina_products');
    localStorage.removeItem('lunina_categories');
    localStorage.removeItem('lunina_variants');
    localStorage.removeItem('lunina_orders');
  }, []);

  // ---- Fetch dữ liệu khởi đầu từ API ----
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingShop(true);

      // Fetch Products
      try {
        const prodRes = await api.get('/product');
        const prodData = prodRes.data?.data;
        if (Array.isArray(prodData)) {
          const mapped = prodData.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: p.basePrice || p.price || 0,
            imageUrl: p.imageUrl || '',
            categoryId: p.category?.id || null,
            stockQuantity: p.stockQuantity ?? 0,
            sold: p.sold ?? 0,
            createdAt: p.createdAt || new Date().toISOString(),
          }));
          setProducts(mapped);

          // Extract variants từ products
          const allVariants = [];
          prodData.forEach(p => {
            (p.variants || []).forEach(v => {
              allVariants.push({
                id: v.id,
                productId: p.id,
                sizeName: v.sizeName,
                colorName: v.colorName,
                price: v.price || 0,
                stock: v.stock || 0,
                variantImageUrl: v.variantImageUrl || '',
              });
            });
          });
          setVariants(allVariants);
        }
      } catch (err) {
        console.warn('Failed to fetch products:', err);
      }

      // Fetch Categories
      try {
        const catRes = await api.get('/categories?page=1&size=1000');
        const catData = catRes.data?.data;
        if (Array.isArray(catData) && catData.length > 0) {
          setCategories(catData);
        }
      } catch (err) {
        console.warn('Failed to fetch categories:', err);
      }

      setLoadingShop(false);
    };

    fetchInitialData();
  }, []);

  // ---- Category CRUD ----
  // Re-fetch toàn bộ từ API để đảm bảo ID đúng từ DB
  const refreshCategories = async () => {
    try {
      const res = await api.get('/categories?page=1&size=1000');
      const catData = res.data?.data;
      if (Array.isArray(catData)) setCategories(catData);
    } catch (err) {
      console.warn('Failed to refresh categories:', err);
    }
  };

  const addCategory = async (data) => {
    const res = await api.post('/categories', { name: data.name, description: data.description || '' });
    if (!res.data?.data) throw new Error('Không thể tạo danh mục');
    await refreshCategories(); // Re-fetch để lấy ID chính xác từ DB
    return res.data.data;
  };

  const updateCategory = async (id, data) => {
    await api.put(`/categories/${id}`, { name: data.name, description: data.description || '' });
    await refreshCategories();
  };

  const deleteCategory = async (id) => {
    await api.delete(`/categories/${id}`);
    await refreshCategories();
  };

  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.name || '—';

  // ---- Product CRUD ----
  const addProduct = async (data) => {
    const payload = {
      name: data.name,
      description: data.description || '',
      basePrice: data.price,
      imageUrl: data.imageUrl || '',
      stockQuantity: data.stockQuantity || 0,
      categoryId: parseInt(data.categoryId),
    };
    const res = await api.post('/product', payload);
    if (!res.data?.data) throw new Error('Không thể tạo sản phẩm');
    const p = res.data.data;
    const newProduct = {
      id: p.id,
      name: p.name || data.name,
      description: p.description || data.description,
      price: p.basePrice || p.price || data.price,
      imageUrl: p.imageUrl || data.imageUrl,
      categoryId: p.category?.id || data.categoryId,
      stockQuantity: data.stockQuantity || 0,
      sold: 0,
      createdAt: p.createdAt || new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id, data) => {
    const payload = {
      name: data.name,
      description: data.description || '',
      basePrice: data.price,
      imageUrl: data.imageUrl || '',
      stockQuantity: data.stockQuantity,
      categoryId: parseInt(data.categoryId),
    };
    await api.put(`/product/${id}`, payload);
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    ));
  };

  const deleteProduct = async (id) => {
    await api.delete(`/product/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
    setVariants(prev => prev.filter(v => v.productId !== id));
  };

  const getProduct = (id) => products.find(p => p.id === parseInt(id));

  // ---- Variant CRUD ----
  const getVariantsByProduct = (productId) => variants.filter(v => v.productId === parseInt(productId));

  const addVariant = async (data) => {
    const payload = {
      sizeName: data.sizeName,
      colorName: data.colorName,
      price: data.price,
      stock: data.stock,
      variantImageUrl: data.variantImageUrl || '',
      productId: data.productId, // Link to product (flat ID)
      product: { id: data.productId } // Send both forms just to be safe with this backend
    };
    const res = await api.post('/product-variant', payload);
    if (!res.data?.data) throw new Error('Không thể tạo phân loại');
    const newV = { ...res.data.data, productId: data.productId };
    setVariants(prev => [...prev, newV]);
    return newV;
  };

  const updateVariant = async (id, data) => {
    const payload = {
      sizeName: data.sizeName,
      colorName: data.colorName,
      price: data.price,
      stock: data.stock,
      variantImageUrl: data.variantImageUrl || '',
      productId: data.productId,
      product: { id: data.productId }
    };
    await api.put(`/product-variant/${id}`, payload);
    setVariants(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  };

  const deleteVariant = async (id) => {
    await api.delete(`/product-variant/${id}`);
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const getVariant = (id) => variants.find(v => v.id === id);

  // ---- Orders ----
  const placeOrder = async ({ userId, deliveryAddress, items, totalAmount, discountApplied }) => {
    try {
      const orderDate = new Date().toISOString();
      const orderRes = await api.post('/order', {
        userId,
        orderDate,
        deliveryAddress,
        totalAmount,
        discountApplied
      });
      if (!orderRes.data?.data) throw new Error(orderRes.data?.message || 'Không thể tạo đơn hàng');

      const createdOrder = orderRes.data.data;
      const orderId = createdOrder.id;

      try {
        await Promise.all(
          items.map(item => api.post('/order-detail', {
            orderId: orderId,
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice || item.price,
          }))
        );
      } catch (err) {
        // Log the actual error to help debugging
        console.error('Failed to create order detail:', err.response?.data || err.message);

        try { await api.delete(`/order/${orderId}`); } catch (e) { } // Rollback order

        const backendMsg = err.response?.data?.message;
        throw new Error(backendMsg || 'Lỗi khi tạo chi tiết đơn hàng. Vui lòng kiểm tra lại sản phẩm.');
      }

      const newOrder = { ...createdOrder, userId, status: createdOrder.status || 0, items };
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      throw new Error(err?.response?.data?.message || err.message || 'Lỗi đặt hàng');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      // Gọi API GET lấy order từ DB thật
      const getRes = await api.get(`/order/${orderId}`);
      if (!getRes.data?.data) throw new Error('Không tìm thấy đơn hàng trên server');
      const order = getRes.data.data;

      let statusEnum = 0; // DANG_DAT
      if (status === 1) statusEnum = 1;
      if (status === 2) statusEnum = 2;

      await api.put(`/order/${orderId}`, {
        userId: order.userId,
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
        totalAmount: order.totalAmount,
        discountApplied: order.discountApplied,
        status: statusEnum
      });

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Lỗi cập nhật trạng thái đơn hàng');
    }
  };

  const getUserOrders = async (userId, returnAll = false) => {
    const res = await api.get('/order');
    if (!res.data?.data) return [];

    const apiOrders = await Promise.all(res.data.data.map(async (o) => {
      let items = [];
      try {
        const detailRes = await api.get(`/order-detail/get-by-orderid?uid=${o.id}`);
        if (detailRes.data?.data) {
          items = detailRes.data.data.map(d => ({
            id: d.id,
            productId: d.product?.id,
            variantId: d.variant?.id || null,
            productName: d.product?.name,
            sizeName: d.variant?.sizeName || null,
            colorName: d.variant?.colorName || null,
            quantity: d.quantity,
            unitPrice: d.unitPrice,
            imageUrl: d.variant?.variantImageUrl || d.product?.imageUrl,
          }));
        }
      } catch (e) {
        console.warn(`Could not fetch details for order ${o.id}:`, e);
      }

      return {
        id: o.id,
        userId: o.userId, // Có thể lọc theo user ở Frontend nếu API chưa lọc
        orderDate: o.orderDate,
        deliveryAddress: o.deliveryAddress,
        totalAmount: o.totalAmount,
        discountApplied: o.discountApplied,
        status: o.status || 0,
        items,
      };
    }));

    setOrders(apiOrders);
    
    // Nếu truyền returnAll = true, trả về toàn bộ. Ngược lại lọc theo userId
    const finalOrders = returnAll ? apiOrders : apiOrders.filter(o => o.userId === userId);
    return finalOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  };

  return (
    <ShopContext.Provider value={{
      products, categories, variants, orders, loadingShop,
      addCategory, updateCategory, deleteCategory, getCategoryName,
      addProduct, updateProduct, deleteProduct, getProduct,
      getVariantsByProduct, addVariant, updateVariant, deleteVariant, getVariant,
      placeOrder, updateOrderStatus, getUserOrders,
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
