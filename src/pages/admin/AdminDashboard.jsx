import { useMemo } from 'react';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatUtils';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';

const MONTH_NAMES = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const AdminDashboard = () => {
  const { orders, products } = useShop();
  const { users } = useAuth();

  const totalRevenue = orders
    .filter((o) => o.status === 1)
    .reduce((s, o) => s + o.totalAmount, 0);

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 1).length;
  const pendingOrders = orders.filter((o) => o.status === 0).length;
  const totalCustomers = users.filter((u) => u.role === 'USER').length;

  // Monthly revenue (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        month: MONTH_NAMES[d.getMonth()],
        year: d.getFullYear(),
        mIndex: d.getMonth(),
        yIndex: d.getFullYear(),
        revenue: 0,
        orders: 0,
      };
    });

    orders.filter((o) => o.status === 1).forEach((o) => {
      const d = new Date(o.orderDate);
      const found = months.find((m) => m.mIndex === d.getMonth() && m.yIndex === d.getFullYear());
      if (found) { found.revenue += o.totalAmount; found.orders += 1; }
    });

    return months.map((m) => ({ name: m.month, 'Doanh thu (tr)': Math.round(m.revenue / 1000000), 'Đơn hàng': m.orders }));
  }, [orders]);

  // Top products
  const topProducts = useMemo(() => {
    const soldMap = {};
    orders.forEach((o) => {
      o.items?.forEach((item) => {
        soldMap[item.productId] = (soldMap[item.productId] || 0) + item.quantity;
      });
    });
    return Object.entries(soldMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, qty]) => {
        const p = products.find((p) => p.id === parseInt(id));
        return { name: p?.name || 'Không rõ', quantity: qty, revenue: qty * (p?.price || 0) };
      });
  }, [orders, products]);

  const statCards = [
    { icon: '💰', label: 'Doanh thu', value: formatCurrency(totalRevenue), color: 'var(--primary)', trend: '↑ Từ đơn hoàn thành' },
    { icon: '📦', label: 'Tổng đơn hàng', value: totalOrders, color: '#1565c0', trend: `${completedOrders} hoàn thành` },
    { icon: '⏳', label: 'Đang xử lý', value: pendingOrders, color: 'var(--warning)', trend: 'Cần xác nhận' },
    { icon: '👥', label: 'Khách hàng', value: totalCustomers, color: 'var(--success)', trend: 'Thành viên đã đăng ký' },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>📊 Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Tổng quan doanh thu và hoạt động cửa hàng</p>
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          {statCards.map((s, i) => (
            <div key={i} className="stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-trend" style={{ color: 'var(--text-muted)' }}>{s.trend}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Revenue Chart */}
          <div className="card">
            <div className="card-header">📈 Doanh thu 6 tháng gần nhất (triệu ₫)</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9e9e9e' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9e9e9e' }} />
                  <Tooltip
                    formatter={(v, n) => [n === 'Doanh thu (tr)' ? `${v} triệu ₫` : v, n]}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e0e0e0' }}
                  />
                  <Legend />
                  <Bar dataKey="Doanh thu (tr)" fill="#ee4d2d" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Đơn hàng" fill="#ff9052" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="card">
            <div className="card-header">🔥 Sản phẩm bán chạy</div>
            <div className="card-body" style={{ padding: '8px 16px' }}>
              {topProducts.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < topProducts.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? '#f9a825' : i === 1 ? '#bdbdbd' : i === 2 ? '#bf6a3e' : 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 800, color: i < 3 ? '#fff' : 'var(--text-muted)',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }} className="line-clamp-1">{p.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Đã bán: {p.quantity} sản phẩm</p>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', flexShrink: 0, fontSize: '12px' }}>
                    {formatCurrency(p.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">📋 Đơn hàng gần nhất</div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {[...orders].sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0,8).map((order) => {
                  const user = users.find((u) => u.id === order.userId);
                  const colors = { 0: '#f9a825', 1: '#2e7d32', 2: '#c62828' };
                  const labels = { 0: 'Đang đặt', 1: 'Đã nhận', 2: 'Đã hủy' };
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, fontSize: '13px' }}>#{String(order.id).padStart(6,'0')}</td>
                      <td style={{ fontSize: '13px' }}>{user?.fullName || 'N/A'}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, background: `${colors[order.status]}18`, color: colors[order.status] }}>
                          {labels[order.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
