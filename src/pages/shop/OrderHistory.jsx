import { useState, useEffect } from 'react';
import { FiPackage, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';
import { formatCurrency, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../utils/formatUtils';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { toast } from 'react-toastify';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 0, label: '⏳ Đang đặt' },
  { key: 1, label: '✅ Đã nhận' },
  { key: 2, label: '❌ Đã hủy' },
];

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const { getUserOrders, updateOrderStatus } = useShop();
  const [tab, setTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const result = await getUserOrders(currentUser.id);
      setAllOrders(result);
      setLoading(false);
    };
    fetchOrders();
  }, [currentUser.id]);

  const filtered = tab === 'all' ? allOrders : allOrders.filter((o) => o.status === tab);

  const handleReceive = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 1);
      toast.success('Đã xác nhận nhận hàng!');
      // Reload lại danh sách
      const result = await getUserOrders(currentUser.id);
      setAllOrders(result);
    } catch (err) {
      toast.error(err.message || 'Lỗi nhận hàng');
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 2);
      toast.info('Đã hủy đơn hàng.');
      const result = await getUserOrders(currentUser.id);
      setAllOrders(result);
    } catch (err) {
      toast.error(err.message || 'Lỗi hủy đơn');
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <div className="container section">
        <h2 style={{ marginBottom: '8px', fontSize: '22px', fontWeight: 800 }}>
          <FiPackage style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary)' }} />
          Đơn hàng của tôi
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          Theo dõi và quản lý tất cả đơn hàng của bạn
        </p>

        <div className="tabs">
          {TABS.map((t) => (
            <div
              key={t.key}
              className={`tab-item ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key !== 'all' && (
                <span style={{ marginLeft: '6px', background: tab === t.key ? 'var(--primary)' : 'var(--bg)', color: tab === t.key ? '#fff' : 'var(--text-muted)', borderRadius: '9999px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>
                  {allOrders.filter((o) => o.status === t.key).length}
                </span>
              )}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>⏳ Đang tải đơn hàng...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">Chưa có đơn hàng</div>
            <p className="empty-state-desc">Hãy mua sắm và quay lại đây nhé!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((order) => (
              <div key={order.id} className="card" style={{ overflow: 'visible' }}>
                {/* Order Header */}
                <div
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Mã đơn hàng</p>
                      <p style={{ fontWeight: 700, fontSize: '14px' }}>#{String(order.id).padStart(6, '0')}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Ngày đặt</p>
                      <p style={{ fontSize: '13px', fontWeight: 500 }}>{formatDate(order.orderDate)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Tổng tiền</p>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
                      borderRadius: '9999px', fontSize: '12px', fontWeight: 700,
                      background: `${ORDER_STATUS_COLOR[order.status]}18`,
                      color: ORDER_STATUS_COLOR[order.status],
                    }}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '20px' }}>
                    {expandedId === order.id ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>

                {/* Order Detail */}
                {expandedId === order.id && (
                  <div style={{ borderTop: '1px solid var(--border-light)', padding: '16px 20px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      📍 Giao tới: <strong>{order.deliveryAddress}</strong>
                    </p>

                    {order.discountApplied > 0 && (
                      <p style={{ fontSize: '13px', color: 'var(--success)', marginBottom: '12px' }}>
                        🎁 Đã giảm giá: <strong>{formatCurrency(order.discountApplied)}</strong>
                      </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                          <img src={item.imageUrl} alt={item.productName} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{item.productName}</p>
                            {(item.colorName || item.sizeName) && (
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                {item.colorName} {item.sizeName ? `- Size ${item.sizeName}` : ''}
                              </p>
                            )}
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>x{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                          </div>
                          <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    {order.status === 0 && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleReceive(order.id)}>
                          ✅ Xác nhận đã nhận
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(order.id)}>
                          ❌ Hủy đơn
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistory;
