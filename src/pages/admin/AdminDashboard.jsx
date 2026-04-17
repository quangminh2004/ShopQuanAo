import { useMemo, useState, useEffect } from 'react';
import { useShop } from '../../contexts/ShopContext';
import { formatCurrency } from '../../utils/formatUtils';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const AdminDashboard = () => {
  const { orders } = useShop();
  const [stats, setStats] = useState(null);
  const [usersInfo, setUsersInfo] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [res, userRes] = await Promise.all([
          api.get('/api/v1/admin/dashboard/summary'),
          api.get('/user?page=1&size=1000')
        ]);

        if (res.data?.data) {
          setStats(res.data.data);
        }

        if (userRes.data?.data?.content) {
          setUsersInfo(userRes.data.data.content);
        } else if (Array.isArray(userRes.data?.data)) {
          setUsersInfo(userRes.data.data);
        }
      } catch (err) {
        console.error('Lỗi lấy dashboard:', err);
      }
    };
    fetchDashboard();
  }, []);

  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const pendingOrders = stats?.processingOrders || 0;
  const totalCustomers = stats?.totalCustomers || 0;

  const monthlyData = useMemo(() => {
    if (!stats || !stats.revenueChart) return [];
    const chartRows = Array.isArray(stats.revenueChart) ? stats.revenueChart : [];
    const rawRevenueList = chartRows.map((m) => Number(m.revenue ?? m.totalRevenue ?? 0) || 0);
    const rawRevenueSum = rawRevenueList.reduce((sum, value) => sum + value, 0);
    const totalRevenueValue = Number(stats.totalRevenue || 0);

    // Some APIs return monthly revenue in "million VND" while totals are in VND.
    // Detect the likely unit by comparing chart sum vs total revenue.
    const distanceIfVnd = Math.abs(totalRevenueValue - rawRevenueSum);
    const distanceIfMillion = Math.abs(totalRevenueValue - (rawRevenueSum * 1000000));
    const revenueScale = distanceIfMillion < distanceIfVnd ? 1000000 : 1;

    return chartRows.map(m => ({
      name: m.month || m.label || '',
      'Doanh thu (đ)': (Number(m.revenue ?? m.totalRevenue ?? 0) || 0) * revenueScale,
      'Đơn hàng': m.orderCount ?? m.totalOrders ?? 0
    }));
  }, [stats]);

  const topProductsList = useMemo(() => {
    if (!stats || !stats.topProducts) return [];
    return stats.topProducts.map(p => ({
      name: p.productName || 'Không rõ',
      quantity: p.totalSold || 0,
      revenue: p.totalRevenue || 0
    }));
  }, [stats]);

  const statCards = [
    { icon: '💰', label: 'Tổng doanh thu', value: formatCurrency(totalRevenue), color: 'var(--primary)', trend: 'Hôm nay / Tuần này' },
    { icon: '📦', label: 'Tổng đơn hàng', value: totalOrders, color: '#1565c0', trend: 'Tất cả đơn hàng' },
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
            <div className="card-header">📈 Doanh thu 6 tháng gần nhất (₫)</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9e9e9e' }} />
                  <YAxis
                    yAxisId="revenue"
                    tick={{ fontSize: 12, fill: '#9e9e9e' }}
                    tickFormatter={(value) => formatCurrency(Number(value) || 0)}
                    width={90}
                  />
                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    tick={{ fontSize: 12, fill: '#9e9e9e' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(v, n) => [n === 'Doanh thu (đ)' ? formatCurrency(Number(v) || 0) : v, n]}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e0e0e0' }}
                  />
                  <Legend />
                  <Bar yAxisId="revenue" dataKey="Doanh thu (đ)" fill="#ee4d2d" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="orders" dataKey="Đơn hàng" fill="#ff9052" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="card">
            <div className="card-header">🔥 Sản phẩm bán chạy</div>
            <div className="card-body" style={{ padding: '8px 16px' }}>
              {topProductsList.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < topProductsList.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
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
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
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
                {[...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 8).map((order) => {
                  const user = usersInfo.find((u) => u.id === order.userId);
                  const colors = { 0: '#f9a825', 1: '#2e7d32', 2: '#c62828' };
                  const labels = { 0: 'Đang đặt', 1: 'Đã nhận', 2: 'Đã hủy' };
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, fontSize: '13px' }}>#{String(order.id).padStart(6, '0')}</td>
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
