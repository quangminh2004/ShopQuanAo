import { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';
import { RANK_CONFIG, getRankProgress, getNextRank } from '../../utils/rankUtils';
import { formatCurrency, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../utils/formatUtils';
import RankBadge from '../../components/common/RankBadge';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { toast } from 'react-toastify';

const Profile = () => {
  const { currentUser, updateUser } = useAuth();
  const { getUserOrders } = useShop();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: currentUser.fullName,
    email: currentUser.email,
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const data = await getUserOrders(currentUser.id);
        setOrders(data || []);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [currentUser.id]);
  const rank = currentUser.rank;
  const rankConfig = RANK_CONFIG[rank];
  const nextRank = getNextRank(rank);
  const progress = getRankProgress(currentUser.totalSpending, rank);

  const handleSave = () => {
    if (!form.fullName || !form.email) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    updateUser({ ...currentUser, ...form });
    setEditing(false);
    toast.success('Cập nhật thông tin thành công!');
  };

  const allRanks = ['NORMAL', 'DONG', 'BAC', 'VANG', 'KIM_CUONG'];

  return (
    <div className="page-wrapper">
      <Header />
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Profile Card */}
            <div className="card">
              <div style={{ background: rankConfig.gradient, padding: '32px 20px 60px', textAlign: 'center', position: 'relative' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, color: '#fff', margin: '0 auto', border: '3px solid rgba(255,255,255,0.5)' }}>
                  {currentUser.fullName.charAt(0)}
                </div>
                <h3 style={{ color: '#fff', marginTop: '12px', fontSize: '18px', fontWeight: 800 }}>{currentUser.fullName}</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>@{currentUser.username || currentUser.email}</p>
              </div>

              <div style={{ margin: '-40px 20px 0', position: 'relative', zIndex: 1 }}>
                <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                  <RankBadge rank={rank} size="lg" />
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                      {nextRank
                        ? `${formatCurrency(RANK_CONFIG[nextRank].minSpending - currentUser.totalSpending)} nữa lên ${RANK_CONFIG[nextRank].label}`
                        : '🎉 Bạn đang ở hạng cao nhất!'}
                    </p>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%`, background: rankConfig.gradient }}
                      />
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{progress}%</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                {[
                  { label: '💰 Tổng chi tiêu', value: formatCurrency(currentUser.totalSpending), highlight: true },
                  { label: '⭐ Điểm tích lũy', value: `${currentUser.points?.toLocaleString() || 0} điểm` },
                  { label: '📦 Tổng đơn hàng', value: loadingOrders ? '⏳...' : `${orders.length} đơn` },
                  { label: '✅ Đã hoàn thành', value: loadingOrders ? '⏳...' : `${orders.filter((o) => o.status === 1).length} đơn` },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: item.highlight ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rank Table */}
            <div className="card">
              <div className="card-header">🏆 Bảng hạng thẻ</div>
              <div className="card-body" style={{ padding: '8px 16px' }}>
                {allRanks.map((r) => {
                  const cfg = RANK_CONFIG[r];
                  const isCurrentRank = r === rank;
                  return (
                    <div key={r} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px', borderRadius: 'var(--radius-md)', marginBottom: '6px',
                      background: isCurrentRank ? cfg.bgColor : 'transparent',
                      border: isCurrentRank ? `1.5px solid ${cfg.color}` : '1.5px solid transparent',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{cfg.icon}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                        {isCurrentRank && <span style={{ fontSize: '10px', background: cfg.color, color: '#fff', padding: '1px 6px', borderRadius: '9999px' }}>Hiện tại</span>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>≥ {formatCurrency(cfg.minSpending)}</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>-{cfg.discount * 100}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Personal Info */}
            <div className="card">
              <div className="card-header">
                👤 Thông tin cá nhân
                {!editing ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                    <FiEdit2 /> Chỉnh sửa
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSave}><FiSave /> Lưu</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><FiX /></button>
                  </div>
                )}
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {[
                    { label: 'Họ và tên', field: 'fullName', type: 'text' },
                    { label: 'Email', field: 'email', type: 'email' },
                  ].map(({ label, field, type }) => (
                    <div className="form-group" key={field} style={{ marginBottom: 0 }}>
                      <label className="form-label">{label}</label>
                      {editing ? (
                        <input
                          className="form-input"
                          type={type}
                          value={form[field]}
                          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        />
                      ) : (
                        <p style={{ fontSize: '14px', padding: '10px 0', fontWeight: 500 }}>{currentUser[field] || '—'}</p>
                      )}
                    </div>
                  ))}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tên đăng nhập</label>
                    <p style={{ fontSize: '14px', padding: '10px 0', fontWeight: 500, color: 'var(--text-muted)' }}>{currentUser.username || currentUser.email}</p>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Vai trò</label>
                    <p style={{ fontSize: '14px', padding: '10px 0' }}>
                      <span className={`badge ${currentUser.role === 'ADMIN' ? 'badge-error' : 'badge-info'}`}>
                        {currentUser.role}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
              <div className="card-header">📦 Lịch sử mua hàng gần đây</div>
              {loadingOrders ? (
                <div className="card-body">
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <div className="empty-state-title">Đang tải lịch sử...</div>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="card-body">
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <div className="empty-state-icon" style={{ fontSize: '36px' }}>📭</div>
                    <div className="empty-state-title">Chưa có đơn hàng</div>
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Ngày đặt</th>
                        <th>Sản phẩm</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 8).map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 700, fontSize: '13px' }}>#{String(order.id).padStart(6, '0')}</td>
                          <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(order.orderDate)}</td>
                          <td style={{ fontSize: '13px' }}>{order.items?.length} sản phẩm</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>{formatCurrency(order.totalAmount)}</td>
                          <td>
                            <span style={{
                              display: 'inline-flex', padding: '3px 10px', borderRadius: '9999px',
                              fontSize: '11px', fontWeight: 700,
                              background: `${ORDER_STATUS_COLOR[order.status]}18`,
                              color: ORDER_STATUS_COLOR[order.status],
                            }}>
                              {ORDER_STATUS_LABEL[order.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
