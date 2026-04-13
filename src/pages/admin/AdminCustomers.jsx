import { useState, useEffect } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';
import api from '../../utils/api';
import { RANK_CONFIG, getRankProgress, getNextRank } from '../../utils/rankUtils';
import { formatCurrency, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../utils/formatUtils';
import RankBadge from '../../components/common/RankBadge';
import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/common/Modal';

const AdminCustomers = () => {
  const { users: localUsers } = useAuth();
  const { getUserOrders } = useShop();
  const [apiUsers, setApiUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [rankFilter, setRankFilter] = useState('Tất cả');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Hiển thị users từ API nếu có, fallback về localStorage
  const users = apiUsers.length > 0 ? apiUsers : localUsers;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await api.get('/user?page=1&size=1000');
        if (res.data?.data) {
          // Map từ backend schema: { id, fullName, email, address, totalSpending, points, rank, role }
          const mapped = res.data.data.map(u => ({
            id: u.id,
            fullName: u.fullName || 'Chưa có tên',
            email: u.email,
            address: u.address,
            totalSpending: u.totalSpending || 0,
            points: u.points || 0,
            rank: u.rank || 'NORMAL',
            role: u.role || 'USER',
            username: u.email, // Dùng email làm username hiển thị
          }));
          setApiUsers(mapped);
        }
      } catch(err) {
        console.warn('API fetch users fail:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSelectUser = async (u) => {
    setSelectedUser(u);
    setLoadingOrders(true);
    try {
      const orders = await getUserOrders(u.id);
      setSelectedUserOrders(orders || []);
    } finally {
      setLoadingOrders(false);
    }
  };

  const customers = users.filter((u) => u.role === 'USER');

  const filtered = customers.filter((u) => {
    const matchSearch = !search.trim() ||
      (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRank = rankFilter === 'Tất cả' || u.rank === rankFilter;
    return matchSearch && matchRank;
  });

  const ranks = ['Tất cả', 'NORMAL', 'DONG', 'BAC', 'VANG', 'KIM_CUONG'];

  const rankStats = ranks.slice(1).map((r) => ({
    rank: r,
    count: customers.filter((u) => u.rank === r).length,
    config: RANK_CONFIG[r],
  }));

  return (
    <AdminLayout>
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>👥 Quản lý khách hàng</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{customers.length} thành viên</p>
        </div>

        {/* Rank Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {rankStats.map(({ rank, count, config }) => (
            <div key={rank} style={{
              background: '#fff', borderRadius: 'var(--radius-lg)', padding: '14px 16px',
              boxShadow: 'var(--shadow-sm)', borderLeft: `4px solid ${config.color}`,
              cursor: 'pointer',
              border: rankFilter === rank ? `2px solid ${config.color}` : `1px solid var(--border-light)`,
            }}
              onClick={() => setRankFilter(rankFilter === rank ? 'Tất cả' : rank)}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{config.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: config.color }}>{count}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{config.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: '380px' }}>
            <FiSearch className="search-bar-icon" />
            <input type="text" placeholder="Tìm khách hàng..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ maxWidth: '180px' }} value={rankFilter} onChange={(e) => setRankFilter(e.target.value)}>
            {ranks.map((r) => (
              <option key={r} value={r}>{r === 'Tất cả' ? 'Tất cả hạng' : RANK_CONFIG[r]?.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Hạng thẻ</th>
                  <th>Tổng chi tiêu</th>
                  <th>Điểm tích lũy</th>
                  <th>Ngày đăng ký</th>
                  <th style={{ textAlign: 'center' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: RANK_CONFIG[u.rank]?.gradient || 'linear-gradient(135deg, #9e9e9e, #bdbdbd)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '14px', color: '#fff', flexShrink: 0,
                        }}>
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{u.fullName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><RankBadge rank={u.rank} size="sm" /></td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(u.totalSpending)}</td>
                    <td style={{ fontWeight: 700, color: '#f9a825' }}>⭐ {u.points?.toLocaleString() || 0}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ textAlign: 'center' }}>
                       <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleSelectUser(u)}>
                         <FiEye style={{ color: 'var(--info)' }} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state"><div className="empty-state-icon">👤</div><div className="empty-state-title">Không tìm thấy khách hàng</div></div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`👤 ${selectedUser?.fullName}`}
        size="lg"
      >
        {selectedUser && (() => {
          const orders = selectedUserOrders;
          const rankCfg = RANK_CONFIG[selectedUser.rank] || RANK_CONFIG['NORMAL'];
          const nextRank = getNextRank(selectedUser.rank);
          const progress = getRankProgress(selectedUser.totalSpending, selectedUser.rank);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Rank Card */}
              <div style={{ background: rankCfg.gradient, borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: '#fff' }}>
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div style={{ flex: 1, color: '#fff' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '2px' }}>{selectedUser.fullName}</div>
                  <div style={{ fontSize: '13px', opacity: 0.8 }}>{selectedUser.email}</div>
                </div>
                <div style={{ textAlign: 'right', color: '#fff' }}>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Hạng thẻ</div>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>{rankCfg.icon} {rankCfg.label}</div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Tổng chi tiêu', value: formatCurrency(selectedUser.totalSpending), color: 'var(--primary)' },
                  { label: 'Điểm tích lũy', value: `⭐ ${selectedUser.points?.toLocaleString() || 0}`, color: '#f9a825' },
                  { label: 'Tổng đơn hàng', value: loadingOrders ? '⏳...' : `${orders.length} đơn`, color: '#1565c0' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color, marginBottom: '4px' }}>{value}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {nextRank && (
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tiến độ lên hạng <strong>{RANK_CONFIG[nextRank].label}</strong></span>
                    <span style={{ fontWeight: 700 }}>{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, background: rankCfg.gradient }} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Cần thêm {formatCurrency(RANK_CONFIG[nextRank].minSpending - selectedUser.totalSpending)} để lên hạng
                  </p>
                </div>
              )}

              {/* Order History */}
              <div>
                <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Lịch sử đơn hàng ({orders.length})</h4>
                {orders.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Chưa có đơn hàng</p>
                ) : (
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <table className="table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Ngày đặt</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td style={{ fontWeight: 700 }}>#{String(o.id).padStart(6, '0')}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{formatDate(o.orderDate)}</td>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(o.totalAmount)}</td>
                            <td>
                              <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, background: `${ORDER_STATUS_COLOR[o.status]}18`, color: ORDER_STATUS_COLOR[o.status] }}>
                                {ORDER_STATUS_LABEL[o.status]}
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
          );
        })()}
      </Modal>
    </AdminLayout>
  );
};

export default AdminCustomers;
