import { useState, useEffect } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp, FiEye } from 'react-icons/fi';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../utils/formatUtils';
import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/common/Modal';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = ['Tất cả', 'DANG_DAT', 'DA_NHAN', 'DA_HUY'];

const AdminOrders = () => {
  const { getUserOrders, updateOrderStatus } = useShop();
  const { users, currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        // Admin cũng gọi API GET /order để lấy toàn bộ đơn hàng
        const result = await getUserOrders(currentUser?.id);
        setOrders(result || []);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders
    .filter((o) => statusFilter === 'Tất cả' || o.status === statusFilter)
    .filter((o) => {
      if (!search.trim()) return true;
      const user = users.find((u) => u.id === o.userId);
      return (
        String(o.id).includes(search) ||
        user?.fullName?.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  const handleStatus = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    toast.success('Cập nhật trạng thái thành công!');
    if (detailOrder?.id === orderId) {
      setDetailOrder((o) => ({ ...o, status: newStatus }));
    }
    // Reload lại danh sách
    const result = await getUserOrders(currentUser?.id);
    setOrders(result || []);
  };

  // User lookup: tìm theo userId hoặc email (backend trả về email)
  const getUser = (userId) => users.find((u) => u.id === userId || u.email === userId);

  return (
    <AdminLayout>
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>📦 Quản lý đơn hàng</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{orders.length} tổng đơn hàng</p>
        </div>

        {/* Summary tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { key: 'Tất cả', label: 'Tất cả', color: '#1565c0', count: orders.length },
            { key: 'DANG_DAT', label: 'Đang đặt', color: '#f9a825', count: orders.filter((o) => o.status === 'DANG_DAT').length },
            { key: 'DA_NHAN', label: 'Đã nhận', color: '#2e7d32', count: orders.filter((o) => o.status === 'DA_NHAN').length },
            { key: 'DA_HUY', label: 'Đã hủy', color: '#c62828', count: orders.filter((o) => o.status === 'DA_HUY').length },
          ].map((s) => (
            <div
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              style={{
                background: statusFilter === s.key ? s.color : '#fff',
                borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                border: `2px solid ${statusFilter === s.key ? s.color : 'var(--border-light)'}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '22px', fontWeight: 800, color: statusFilter === s.key ? '#fff' : s.color }}>{s.count}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: statusFilter === s.key ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <div className="search-bar" style={{ maxWidth: '380px' }}>
            <FiSearch className="search-bar-icon" />
            <input type="text" placeholder="Tìm mã đơn, tên khách..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>SP</th>
                  <th>Giảm giá</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loadingOrders ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>⏳ Đang tải đơn hàng...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>📭 Không có đơn hàng nào</td></tr>
                ) : filtered.map((order) => {
                  const user = getUser(order.userId);
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, fontSize: '13px' }}>#{String(order.id).padStart(6, '0')}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{user?.fullName || order.userEmail || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email || order.userEmail || ''}</div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(order.orderDate)}</td>
                      <td style={{ fontWeight: 600 }}>{order.items?.length || 0}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {order.discountApplied > 0 ? `-${formatCurrency(order.discountApplied)}` : '—'}
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', padding: '4px 12px', borderRadius: '9999px',
                          fontSize: '12px', fontWeight: 700,
                          background: `${ORDER_STATUS_COLOR[order.status]}18`,
                          color: ORDER_STATUS_COLOR[order.status],
                        }}>
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" title="Chi tiết" onClick={() => setDetailOrder(order)}>
                            <FiEye style={{ color: 'var(--info)' }} />
                          </button>
                          {order.status === 'DANG_DAT' && (
                            <button className="btn btn-success btn-sm" onClick={() => handleStatus(order.id, 'DA_NHAN')}>
                              ✓ Nhận
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title={`📋 Chi tiết đơn #${String(detailOrder?.id || '').padStart(6, '0')}`}
        size="lg"
      >
        {detailOrder && (() => {
          const user = getUser(detailOrder.userId);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Khách hàng', value: user?.fullName },
                  { label: 'Email', value: user?.email },
                  { label: 'Ngày đặt', value: formatDate(detailOrder.orderDate) },
                  { label: 'Địa chỉ giao hàng', value: detailOrder.deliveryAddress },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{value || '—'}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>Sản phẩm</h4>
                {detailOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                    <img src={item.imageUrl} alt={item.productName} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{item.productName}</p>
                      {(item.colorName || item.sizeName) && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          {item.colorName} {item.sizeName ? `- Size ${item.sizeName}` : ''}
                        </p>
                      )}
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>x{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                    </div>
                    <p style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                {detailOrder.discountApplied > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--success)' }}>Chiết khấu hạng thẻ</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>-{formatCurrency(detailOrder.discountApplied)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 800 }}>
                  <span>Tổng cộng</span>
                  <span style={{ color: 'var(--primary)' }}>{formatCurrency(detailOrder.totalAmount)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {detailOrder.status === 'DANG_DAT' && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => handleStatus(detailOrder.id, 'DA_NHAN')}>✅ Xác nhận nhận hàng</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleStatus(detailOrder.id, 'DA_HUY')}>❌ Hủy đơn</button>
                  </>
                )}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '9999px',
                  fontSize: '13px', fontWeight: 700,
                  background: `${ORDER_STATUS_COLOR[detailOrder.status]}18`,
                  color: ORDER_STATUS_COLOR[detailOrder.status],
                }}>
                  {ORDER_STATUS_LABEL[detailOrder.status]}
                </span>
              </div>
            </div>
          );
        })()}
      </Modal>
    </AdminLayout>
  );
};

export default AdminOrders;
